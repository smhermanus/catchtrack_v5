import { Pool } from 'pg';
import { DateTime } from 'luxon';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface AnalyticsOptions {
  startDate?: string;
  endDate?: string;
  userId?: string;
  resourceType?: string;
  action?: string;
  groupBy?: string[];
  limit?: number;
}

interface TimeSeriesData {
  timestamp: string; // Remove the possibility of null
  count: number;
  metadata: Record<string, any>;
}

interface DBTimeSeriesRow {
  timestamp: Date | null; // Allow null in the database row
  count: string | number;
}

interface ActionSummary {
  action: string;
  count: number;
}

interface ResourceSummary {
  resourceType: string;
  count: number;
}

interface UserActivitySummary {
  userId: string;
  totalActions: number;
  lastActive: string; // Remove the possibility of null
  mostFrequentActions: ActionSummary[];
  resourcesAccessed: ResourceSummary[];
}

interface ResourceUsageStats {
  resourceType: string;
  totalAccesses: number;
  uniqueUsers: number;
  averageDuration: number;
  peakUsageTime: string;
}

export class AuditAnalytics {
  private static instance: AuditAnalytics;

  private constructor() {}

  public static getInstance(): AuditAnalytics {
    if (!AuditAnalytics.instance) {
      AuditAnalytics.instance = new AuditAnalytics();
    }
    return AuditAnalytics.instance;
  }

  public async getActivityTimeline(options: AnalyticsOptions): Promise<TimeSeriesData[]> {
    const params: any[] = [];
    let query = `
      SELECT 
        COALESCE(date_trunc('hour', created_at), NOW()) as timestamp,
        COUNT(*) as count
      FROM audit_logs
      WHERE 1=1
    `;

    if (options.startDate) {
      params.push(options.startDate);
      query += ` AND created_at >= $${params.length}`;
    }
    if (options.endDate) {
      params.push(options.endDate);
      query += ` AND created_at <= $${params.length}`;
    }
    if (options.userId) {
      params.push(options.userId);
      query += ` AND user_id = $${params.length}`;
    }
    if (options.action) {
      params.push(options.action);
      query += ` AND action = $${params.length}`;
    }

    query += `
      GROUP BY date_trunc('hour', created_at)
      ORDER BY timestamp ASC
    `;

    const { rows } = await pool.query(query, params);

    return rows
      .map((row: DBTimeSeriesRow) => {
        // Ensure timestamp is always a valid string
        const timestamp = row.timestamp
          ? DateTime.fromJSDate(row.timestamp).toISO()
          : DateTime.now().toISO();

        return {
          timestamp, // This is now guaranteed to be a string
          count: Number(row.count),
          metadata: {}, // Ensure metadata is always an object
        };
      })
      .filter((entry): entry is TimeSeriesData => !!entry.timestamp); // Type predicate to satisfy TypeScript
  }

  public async getUserActivitySummaries(options: AnalyticsOptions): Promise<UserActivitySummary[]> {
    const query = `
      WITH user_actions AS (
        SELECT 
          user_id,
          COUNT(*) as total_actions,
          MAX(created_at) as last_active,
          array_agg(DISTINCT action) as actions,
          array_agg(DISTINCT resource_type) as resources
        FROM audit_logs
        GROUP BY user_id
      ),
      action_counts AS (
        SELECT 
          user_id,
          action,
          COUNT(*) as count
        FROM audit_logs
        GROUP BY user_id, action
      ),
      resource_counts AS (
        SELECT 
          user_id,
          resource_type,
          COUNT(*) as count
        FROM audit_logs
        GROUP BY user_id, resource_type
      )
      SELECT 
        ua.user_id,
        ua.total_actions,
        ua.last_active,
        COALESCE(
          array_agg(
            json_build_object(
              'action', ac.action,
              'count', ac.count
            )
          ) FILTER (WHERE ac.action IS NOT NULL),
          '{}'::json[]
        ) as most_frequent_actions,
        COALESCE(
          array_agg(
            json_build_object(
              'resourceType', rc.resource_type,
              'count', rc.count
            )
          ) FILTER (WHERE rc.resource_type IS NOT NULL),
          '{}'::json[]
        ) as resources_accessed
      FROM user_actions ua
      LEFT JOIN action_counts ac ON ua.user_id = ac.user_id
      LEFT JOIN resource_counts rc ON ua.user_id = rc.user_id
      GROUP BY ua.user_id, ua.total_actions, ua.last_active
    `;

    const { rows } = await pool.query(query);

    return rows
      .map((row: any) => {
        // Ensure lastActive is always a valid string
        const lastActive = row.last_active
          ? DateTime.fromJSDate(row.last_active).toISO()
          : DateTime.now().toISO();

        const mostFrequentActions = (
          Array.isArray(row.most_frequent_actions) ? row.most_frequent_actions : []
        ) as ActionSummary[];

        const resourcesAccessed = (
          Array.isArray(row.resources_accessed) ? row.resources_accessed : []
        ) as ResourceSummary[];

        return {
          userId: row.user_id,
          totalActions: Number(row.total_actions),
          lastActive, // This is now guaranteed to be a string
          mostFrequentActions: mostFrequentActions.sort((a, b) => b.count - a.count).slice(0, 5),
          resourcesAccessed,
        } as UserActivitySummary;
      })
      .filter((entry): entry is UserActivitySummary => !!entry.lastActive); // Type predicate to satisfy TypeScript
  }

  public async getResourceUsageStats(options: AnalyticsOptions): Promise<ResourceUsageStats[]> {
    const query = `
      WITH resource_stats AS (
        SELECT 
          resource_type,
          COUNT(*) as total_accesses,
          COUNT(DISTINCT user_id) as unique_users,
          AVG(COALESCE((metadata->>'duration')::numeric, 0)) as avg_duration,
          date_part('hour', created_at) as hour,
          COUNT(*) as hour_count
        FROM audit_logs
        GROUP BY resource_type, date_part('hour', created_at)
      ),
      peak_usage AS (
        SELECT 
          resource_type,
          hour,
          hour_count,
          ROW_NUMBER() OVER (PARTITION BY resource_type ORDER BY hour_count DESC) as rn
        FROM resource_stats
      )
      SELECT 
        rs.resource_type,
        SUM(rs.total_accesses) as total_accesses,
        MAX(rs.unique_users) as unique_users,
        AVG(rs.avg_duration) as average_duration,
        MIN(CASE WHEN pu.rn = 1 THEN pu.hour ELSE NULL END) as peak_hour
      FROM resource_stats rs
      JOIN peak_usage pu ON rs.resource_type = pu.resource_type
      GROUP BY rs.resource_type
    `;

    const { rows } = await pool.query(query);

    return rows.map((row) => ({
      resourceType: row.resource_type,
      totalAccesses: Number(row.total_accesses),
      uniqueUsers: Number(row.unique_users),
      averageDuration: Number(row.average_duration),
      peakUsageTime: `${row.peak_hour.toString().padStart(2, '0')}:00`,
    }));
  }

  public async detectAnomalies(options: AnalyticsOptions): Promise<any[]> {
    // Implement anomaly detection with direct SQL queries
    return [];
  }

  public async generateComplianceReport(options: AnalyticsOptions): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_events,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT action) as unique_actions
      FROM audit_logs
    `;

    const { rows } = await pool.query(query);
    return {
      totalEvents: Number(rows[0].total_events),
      uniqueUsers: Number(rows[0].unique_users),
      uniqueActions: Number(rows[0].unique_actions),
    };
  }
}

export const auditAnalytics = AuditAnalytics.getInstance();

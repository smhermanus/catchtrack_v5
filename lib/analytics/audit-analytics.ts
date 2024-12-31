import { createClient } from '@supabase/supabase-js';
import { DateTime } from 'luxon';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

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
  timestamp: string;
  count: number;
  metadata?: Record<string, any>;
}

interface UserActivitySummary {
  userId: string;
  totalActions: number;
  lastActive: string;
  mostFrequentActions: { action: string; count: number }[];
  resourcesAccessed: { resourceType: string; count: number }[];
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
    const query = supabase
      .from('audit_logs')
      .select('created_at, action, metadata')
      .order('created_at', { ascending: true });

    if (options.startDate) {
      query.gte('created_at', options.startDate);
    }
    if (options.endDate) {
      query.lte('created_at', options.endDate);
    }
    if (options.userId) {
      query.eq('user_id', options.userId);
    }
    if (options.action) {
      query.eq('action', options.action);
    }

    const { data, error } = await query;
    if (error) throw error;

    return this.aggregateTimeSeriesData(data);
  }

  public async getUserActivitySummaries(options: AnalyticsOptions): Promise<UserActivitySummary[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        user_id,
        action,
        resource_type,
        created_at,
        metadata
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return this.aggregateUserActivity(data);
  }

  public async getResourceUsageStatistics(options: AnalyticsOptions): Promise<ResourceUsageStats[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        resource_type,
        user_id,
        created_at,
        metadata
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return this.aggregateResourceUsage(data);
  }

  public async getAnomalyDetection(options: AnalyticsOptions): Promise<any[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return this.detectAnomalies(data);
  }

  public async getComplianceReport(options: AnalyticsOptions): Promise<any> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return this.generateComplianceReport(data);
  }

  private aggregateTimeSeriesData(data: any[]): TimeSeriesData[] {
    const timeSeriesMap = new Map<string, TimeSeriesData>();

    data.forEach(log => {
      const timestamp = DateTime.fromISO(log.created_at).startOf('hour').toISO();
      const existing = timeSeriesMap.get(timestamp) || { timestamp, count: 0, metadata: {} };
      existing.count++;
      timeSeriesMap.set(timestamp, existing);
    });

    return Array.from(timeSeriesMap.values()).sort((a, b) => 
      DateTime.fromISO(a.timestamp).toMillis() - DateTime.fromISO(b.timestamp).toMillis()
    );
  }

  private aggregateUserActivity(data: any[]): UserActivitySummary[] {
    const userMap = new Map<string, any>();

    data.forEach(log => {
      const userId = log.user_id;
      const existing = userMap.get(userId) || {
        userId,
        totalActions: 0,
        lastActive: log.created_at,
        actions: new Map<string, number>(),
        resources: new Map<string, number>(),
      };

      existing.totalActions++;
      existing.actions.set(log.action, (existing.actions.get(log.action) || 0) + 1);
      existing.resources.set(log.resource_type, (existing.resources.get(log.resource_type) || 0) + 1);
      userMap.set(userId, existing);
    });

    return Array.from(userMap.values()).map(user => ({
      userId: user.userId,
      totalActions: user.totalActions,
      lastActive: user.lastActive,
      mostFrequentActions: Array.from(user.actions.entries())
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      resourcesAccessed: Array.from(user.resources.entries())
        .map(([resourceType, count]) => ({ resourceType, count }))
        .sort((a, b) => b.count - a.count),
    }));
  }

  private aggregateResourceUsage(data: any[]): ResourceUsageStats[] {
    const resourceMap = new Map<string, any>();

    data.forEach(log => {
      const resourceType = log.resource_type;
      const existing = resourceMap.get(resourceType) || {
        resourceType,
        totalAccesses: 0,
        uniqueUsers: new Set(),
        durations: [],
        usageByHour: new Map<number, number>(),
      };

      existing.totalAccesses++;
      existing.uniqueUsers.add(log.user_id);
      if (log.metadata?.duration) {
        existing.durations.push(log.metadata.duration);
      }

      const hour = DateTime.fromISO(log.created_at).hour;
      existing.usageByHour.set(hour, (existing.usageByHour.get(hour) || 0) + 1);

      resourceMap.set(resourceType, existing);
    });

    return Array.from(resourceMap.values()).map(resource => ({
      resourceType: resource.resourceType,
      totalAccesses: resource.totalAccesses,
      uniqueUsers: resource.uniqueUsers.size,
      averageDuration: resource.durations.length
        ? resource.durations.reduce((a: number, b: number) => a + b, 0) / resource.durations.length
        : 0,
      peakUsageTime: Array.from(resource.usageByHour.entries())
        .sort((a, b) => b[1] - a[1])[0][0]
        .toString()
        .padStart(2, '0') + ':00',
    }));
  }

  private detectAnomalies(data: any[]): any[] {
    // Implement anomaly detection algorithms
    // Example: Detect sudden spikes in activity or unusual patterns
    return [];
  }

  private generateComplianceReport(data: any[]): any {
    // Generate compliance reports based on audit logs
    return {
      totalEvents: data.length,
      // Add more compliance metrics
    };
  }
}

export const auditAnalytics = AuditAnalytics.getInstance();

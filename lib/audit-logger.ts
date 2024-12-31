import { createClient } from '@supabase/supabase-js';
import { EventEmitter } from 'events';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface AuditEvent {
  type: string;
  action: string;
  userId: string;
  resourceId?: string;
  resourceType?: string;
  details: Record<string, any>;
  metadata: {
    ip?: string;
    userAgent?: string;
    timestamp: string;
    sessionId?: string;
  };
}

class AuditLogger extends EventEmitter {
  private static instance: AuditLogger;
  private batchSize: number = 50;
  private batchTimeout: number = 5000;
  private eventQueue: AuditEvent[] = [];
  private flushTimeout?: NodeJS.Timeout;

  private constructor() {
    super();
    this.setupEventHandlers();
  }

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  private setupEventHandlers() {
    this.on('event', this.queueEvent.bind(this));
    this.on('flush', this.flushEvents.bind(this));
  }

  public async logCollaborationEvent(
    type: string,
    action: string,
    userId: string,
    details: Record<string, any>,
    metadata: Partial<AuditEvent['metadata']> = {}
  ) {
    const event: AuditEvent = {
      type,
      action,
      userId,
      details,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    };

    this.emit('event', event);
  }

  private queueEvent(event: AuditEvent) {
    this.eventQueue.push(event);

    if (this.eventQueue.length >= this.batchSize) {
      this.emit('flush');
    } else if (!this.flushTimeout) {
      this.flushTimeout = setTimeout(() => {
        this.emit('flush');
      }, this.batchTimeout);
    }
  }

  private async flushEvents() {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = undefined;
    }

    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .insert(events);

      if (error) {
        console.error('Failed to store audit logs:', error);
        // Requeue failed events
        this.eventQueue.push(...events);
      }
    } catch (error) {
      console.error('Error flushing audit logs:', error);
      // Requeue failed events
      this.eventQueue.push(...events);
    }
  }

  public async queryAuditLogs(filters: {
    userId?: string;
    type?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('audit_logs')
      .select('*');

    if (filters.userId) {
      query = query.eq('userId', filters.userId);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.startDate) {
      query = query.gte('metadata->timestamp', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('metadata->timestamp', filters.endDate);
    }

    query = query
      .order('metadata->timestamp', { ascending: false })
      .limit(filters.limit || 100)
      .offset(filters.offset || 0);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to query audit logs: ${error.message}`);
    }

    return data;
  }

  public async getAuditSummary(timeframe: 'day' | 'week' | 'month') {
    const startDate = new Date();
    switch (timeframe) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    const { data, error } = await supabase
      .from('audit_logs')
      .select('type, action, count')
      .gte('metadata->timestamp', startDate.toISOString())
      .group('type, action');

    if (error) {
      throw new Error(`Failed to get audit summary: ${error.message}`);
    }

    return data;
  }
}

export const auditLogger = AuditLogger.getInstance();

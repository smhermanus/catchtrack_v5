import { EventEmitter } from 'events';
import { db } from '@/lib/db';
import { AuditAction } from '@prisma/client';

interface AuditEvent {
  type: string;
  action: AuditAction;
  actionType: string;
  tableName: string;
  recordId: number;
  userId: number;
  details: string;
  changes: string;
  metadata: string;
  resourceId?: string;
  resourceType?: string;
}

export class AuditLogger {
  private events: AuditEvent[] = [];
  private static instance: AuditLogger;
  private emitter: EventEmitter;
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly FLUSH_INTERVAL = 30000; // 30 seconds

  private constructor() {
    this.emitter = new EventEmitter();
    this.setupEventListeners();
    this.startAutoFlush();
  }

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  private setupEventListeners() {
    this.emitter.on('auditLogAdded', async (event: AuditEvent) => {
      // Optional: Immediate processing or additional logging
      console.log('Audit log added:', event);
    });

    // Error handling listener
    this.emitter.on('error', (error: Error) => {
      console.error('Audit Logger Error:', error);
    });
  }

  private startAutoFlush() {
    // Automatically flush logs at regular intervals
    this.flushInterval = setInterval(() => {
      this.flushEvents().catch((error) => {
        this.emitter.emit('error', error);
      });
    }, this.FLUSH_INTERVAL);
  }

  addEvent(event: AuditEvent) {
    // Validate event before adding
    if (!event.action || !event.userId) {
      this.emitter.emit('error', new Error('Invalid audit event'));
      return;
    }

    this.events.push(event);
    // Emit an event for potential additional processing
    this.emitter.emit('auditLogAdded', event);

    // Optional: Flush immediately if events exceed a certain threshold
    if (this.events.length >= 100) {
      this.flushEvents().catch((error) => {
        this.emitter.emit('error', error);
      });
    }
  }

  async logCollaborationEvent(
    action: AuditAction,
    actionType: string,
    userId: string,
    context: {
      quotaId?: string;
      allocationId?: string;
    },
    eventDetails: {
      resourceType: string;
      resourceId: string;
      changes: Record<string, any>;
    }
  ) {
    try {
      const event: AuditEvent = {
        type: 'COLLABORATION',
        action,
        actionType,
        tableName: eventDetails.resourceType,
        recordId: parseInt(eventDetails.resourceId),
        userId: parseInt(userId),
        details: JSON.stringify(context),
        changes: JSON.stringify(eventDetails.changes),
        metadata: JSON.stringify({
          context,
          resourceType: eventDetails.resourceType,
        }),
        resourceId: eventDetails.resourceId,
        resourceType: eventDetails.resourceType,
      };

      this.addEvent(event);
    } catch (error) {
      console.error('Error logging collaboration event:', error);
      this.emitter.emit('error', error);
    }
  }

  async flushEvents() {
    try {
      if (this.events.length === 0) return;

      // Create many audit logs with type conversions
      await db.auditLog.createMany({
        data: this.events.map((event) => ({
          type: event.type,
          action: event.action,
          actionType: event.actionType,
          tableName: event.tableName,
          recordId: event.recordId, // Keep as is, or convert if needed
          userId: event.userId, // Ensure userId is a number
          details: event.details,
          changes: event.changes,
          metadata: event.metadata,
        })),
      });

      // Clear the events after successful flush
      this.events = [];
    } catch (error) {
      console.error('Error flushing audit logs:', error);
      // Optionally, you might want to persist failed events or implement a retry mechanism
      this.emitter.emit('error', error);
    }
  }

  // Manually trigger flush
  triggerFlush() {
    return this.flushEvents();
  }

  // Cleanup method to stop auto-flushing
  cleanup() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
  }
}

// Export a singleton instance
export const auditLogger = AuditLogger.getInstance();

// Optional: Ensure cleanup on process exit
process.on('exit', () => {
  auditLogger.cleanup();
});

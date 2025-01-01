import { db } from '@/lib/db';
import { sendNotification } from './notifications/channels';
import { generateQuotaReport } from './reports';
import { format, startOfWeek, endOfWeek } from 'date-fns';

interface ScheduledTask {
  id: string;
  type: 'report' | 'alert' | 'forecast';
  schedule: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:mm format
  weekday?: number; // 0-6 for weekly tasks
  dayOfMonth?: number; // 1-31 for monthly tasks
  recipients: {
    email?: string;
    phone?: string;
    slackChannel?: string;
    telegramChatId?: string;
  }[];
  channels: string[];
  lastRun?: Date;
  nextRun?: Date;
}

export async function scheduleTask(task: ScheduledTask) {
  try {
    await db.scheduledTask.create({
      data: {
        id: task.id,
        type: task.type,
        schedule: task.schedule,
        time: task.time,
        weekday: task.weekday,
        dayOfMonth: task.dayOfMonth,
        recipients: task.recipients,
        channels: task.channels,
        lastRun: task.lastRun,
        nextRun: calculateNextRun(task),
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to schedule task:', error);
    throw new Error('Failed to schedule task');
  }
}

export async function executeScheduledTasks() {
  try {
    const now = new Date();
    const tasks = await db.scheduledTask.findMany({
      where: {
        nextRun: {
          lte: now,
        },
      },
    });

    for (const task of tasks) {
      try {
        switch (task.type) {
          case 'report':
            await executeReportTask(task);
            break;
          case 'alert':
            await executeAlertTask(task);
            break;
          case 'forecast':
            await executeForecastTask(task);
            break;
        }

        // Update task execution time
        await db.scheduledTask.update({
          where: { id: task.id },
          data: {
            lastRun: now,
            nextRun: calculateNextRun(task),
          },
        });
      } catch (error) {
        console.error(`Failed to execute task ${task.id}:`, error);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to execute scheduled tasks:', error);
    throw new Error('Failed to execute scheduled tasks');
  }
}

async function executeReportTask(task: ScheduledTask) {
  const quotas = await db.quota.findMany({
    include: {
      vessel: true,
      catches: true,
    },
  });

  // Generate reports for different time periods
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());

  const report = await generateQuotaReport(quotas, {
    format: 'pdf',
    includeForecasts: true,
    includeTrends: true,
  });

  // Send report to all recipients through configured channels
  for (const recipient of task.recipients) {
    await sendNotification(
      {
        title: `${task.schedule.charAt(0).toUpperCase() + task.schedule.slice(1)} Quota Report`,
        message: `Here's your ${task.schedule} quota report for ${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`,
        type: 'info',
        data: {
          reportPeriod: `${format(weekStart, 'yyyy-MM-dd')} to ${format(weekEnd, 'yyyy-MM-dd')}`,
          totalQuotas: quotas.length,
        },
      },
      recipient,
      task.channels
    );
  }
}

async function executeAlertTask(task: ScheduledTask) {
  const quotas = await db.quota.findMany({
    include: {
      vessel: true,
      catches: true,
    },
  });

  // Check for quota alerts
  for (const quota of quotas) {
    const totalCatch = quota.catches.reduce((sum, c) => sum + c.weight, 0);
    const remaining = quota.amount - totalCatch;
    const utilizationRate = (totalCatch / quota.amount) * 100;

    if (utilizationRate >= 90) {
      for (const recipient of task.recipients) {
        await sendNotification(
          {
            title: 'Critical Quota Alert',
            message: `Quota for vessel ${quota.vessel.name} is at ${utilizationRate.toFixed(1)}% utilization`,
            type: 'critical',
            data: {
              vesselName: quota.vessel.name,
              remaining: remaining.toFixed(2),
              utilizationRate: utilizationRate.toFixed(1),
            },
          },
          recipient,
          task.channels
        );
      }
    }
  }
}

async function executeForecastTask(task: ScheduledTask) {
  // Implement forecast task execution
}

function calculateNextRun(task: ScheduledTask): Date {
  const now = new Date();
  const [hours, minutes] = task.time.split(':').map(Number);
  const next = new Date(now);

  next.setHours(hours, minutes, 0, 0);

  if (next <= now) {
    switch (task.schedule) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        if (task.weekday !== undefined) {
          next.setDate(next.getDate() + ((7 + task.weekday - next.getDay()) % 7));
        }
        break;
      case 'monthly':
        if (task.dayOfMonth !== undefined) {
          next.setMonth(next.getMonth() + 1);
          next.setDate(task.dayOfMonth);
        }
        break;
    }
  }

  return next;
}

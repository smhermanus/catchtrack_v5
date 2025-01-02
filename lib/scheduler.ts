import { db } from '@/lib/db';
import { sendNotification } from './notifications/channels';
import { generateQuotaReport } from './reports';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Define interfaces based on your Prisma schema
interface QuotaWithRelations {
  id: string;
  totalAllocation: number;
  startDate: Date;
  endDate: Date;
  vessel: {
    id: string;
    name: string;
    registration: string;
    registrationNumber: string;
  };
  catches: Array<{
    id: string;
    weight: number;
    date: Date;
    vesselId: string;
    quotaId: string;
  }>;
}

interface ScheduledTask {
  id: string;
  type: 'report' | 'alert' | 'forecast';
  schedule: 'daily' | 'weekly' | 'monthly';
  time: string;
  weekday?: number;
  dayOfMonth?: number;
  recipients: {
    email?: string;
    phone?: string;
    slackChannel?: string;
  }[];
  channels: string[];
  lastRun?: Date;
  nextRun?: Date;
}

async function executeReportTask(task: ScheduledTask) {
  const prismaQuotas = await db.quota.findMany({
    include: {
      quotaAllocations: {
        include: {
          vessel: true,
        },
      },
      catchRecords: true,
    },
  });

  const quotas = prismaQuotas.map((prismaQuota) => {
    const vesselAllocation = prismaQuota.quotaAllocations[0];
    if (!vesselAllocation?.vessel) {
      throw new Error(`No vessel found for quota ${prismaQuota.id}`);
    }

    return {
      id: prismaQuota.quotaCode,
      totalAllocation: Number(prismaQuota.finalQuotaAllocation),
      startDate: prismaQuota.startDate,
      endDate: prismaQuota.endDate,
      vessel: {
        id: String(vesselAllocation.vessel.id),
        name: vesselAllocation.vessel.name,
        registration: vesselAllocation.vessel.registrationNumber,
        registrationNumber: vesselAllocation.vessel.registrationNumber,
      },
      catches: prismaQuota.catchRecords.map((c) => ({
        id: String(c.id),
        weight: Number(c.totalCatchMass),
        date: c.landingDate,
        vesselId: String(c.vesselId),
        quotaId: String(c.quotaId),
      })),
    } satisfies QuotaWithRelations;
  });

  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());

  const report = await generateQuotaReport(quotas, {
    format: 'pdf',
    includeForecasts: true,
    includeTrends: true,
  });

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
  const prismaQuotas = await db.quota.findMany({
    include: {
      quotaAllocations: {
        include: {
          vessel: true,
        },
      },
      catchRecords: true,
    },
  });

  for (const prismaQuota of prismaQuotas) {
    const vesselAllocation = prismaQuota.quotaAllocations[0];
    if (!vesselAllocation?.vessel) continue;

    const totalCatch = prismaQuota.catchRecords.reduce(
      (sum, c) => sum + Number(c.totalCatchMass),
      0
    );
    const utilizationRate = (totalCatch / Number(prismaQuota.finalQuotaAllocation)) * 100;

    if (utilizationRate >= 90) {
      for (const recipient of task.recipients) {
        await sendNotification(
          {
            title: 'Critical Quota Alert',
            message: `Quota for vessel ${vesselAllocation.vessel.name} is at ${utilizationRate.toFixed(1)}% utilization`,
            type: 'critical',
            data: {
              vesselName: vesselAllocation.vessel.name,
              remaining: (Number(prismaQuota.finalQuotaAllocation) - totalCatch).toFixed(2),
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
  // Implementation for forecast task
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

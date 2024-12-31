'use server';

import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { sendQuotaAlertEmail } from '@/lib/email';
import { addDays, format as formatDate, subDays } from 'date-fns';
import { parse } from 'json2csv';
import { generateQuotaReport } from '@/lib/reports';
import { generateQuotaForecast } from '@/lib/forecasting';

interface QuotaAlert {
  id: string;
  vesselName: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: Date;
  utilizationRate?: number;
  remaining?: number;
}

const quotaSchema = z.object({
  vesselId: z.coerce.number(),
  amount: z.number().min(0),
  startDate: z.date(),
  endDate: z.date(),
  notes: z.string().optional(),
});

export type QuotaFormData = z.infer<typeof quotaSchema>;

export async function getQuotas() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    const quotas = await db.quota.findMany({
      include: {
        quotaAllocations: {
          include: {
            vessel: true,
          },
        },
        catchRecords: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return quotas;
  } catch (error) {
    console.error('Failed to fetch quotas:', error);
    throw error;
  }
}

export async function createQuota(data: QuotaFormData) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'SYSTEMADMINISTRATOR') {
      throw new Error('Unauthorized');
    }

    const validatedData = quotaSchema.parse(data);

    // Generate a unique quota code
    const quotaCode = `Q${Date.now()}`;

    const quota = await db.quota.create({
      data: {
        ...validatedData,
        quotaCode,
        status: 'VALID',
        season: new Date().getFullYear().toString(),
        marineResources: [],
        productType: 'STANDARD',
        sectorName: 'COMMERCIAL',
        quotaAllocation: validatedData.amount,
        finalQuotaAllocation: validatedData.amount,
        createdBy: parseInt(session.user.id),
      },
    });

    revalidatePath('/admin/quotas');
    return { success: true, quota };
  } catch (error) {
    console.error('Failed to create quota:', error);
    throw error;
  }
}

export async function deleteQuota(quotaId: string) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'SYSTEMADMINISTRATOR') {
      throw new Error('Unauthorized');
    }

    await db.quota.delete({
      where: { id: parseInt(quotaId, 10) },
    });

    revalidatePath('/admin/quotas');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete quota:', error);
    throw error;
  }
}

// Add these new actions for analytics and tracking
export async function getQuotaAnalytics() {
  try {
    const quotas = await db.quota.findMany({
      include: {
        catchRecords: true,
        quotaAllocations: {
          include: {
            vessel: true
          }
        }
      }
    });

    const vesselUtilization = quotas.map((quota) => {
      const allocated = parseFloat(quota.quotaAllocation.toString());
      const used = quota.catchRecords.reduce((sum, record) => 
        sum + parseFloat(record.totalCatchMass.toString()), 0);
      const remaining = allocated - used;
      const utilizationRate = (used / allocated) * 100;

      return {
        vesselName: quota.quotaAllocations[0]?.vessel?.name || 'Unknown',
        allocated,
        used,
        remaining,
        utilizationRate
      };
    });

    return vesselUtilization;
  } catch (error) {
    console.error('Failed to get quota analytics:', error);
    throw error;
  }
}

export async function getQuotaAlerts() {
  try {
    const quotas = await db.quota.findMany({
      include: {
        catchRecords: true,
        quotaAllocations: {
          include: {
            vessel: true,
          },
        },
      },
    });

    const alerts: QuotaAlert[] = [];

    quotas.forEach((quota) => {
      const totalCatch = quota.catchRecords.reduce(
        (sum, record) => sum + parseFloat(record.totalCatchMass.toString()),
        0
      );
      const allocated = parseFloat(quota.quotaAllocation.toString());
      const remaining = allocated - totalCatch;
      const utilizationRate = (totalCatch / allocated) * 100;

      // Check for various alert conditions
      if (utilizationRate >= 90) {
        alerts.push({
          id: `${quota.id}-high-util`,
          type: 'critical',
          vesselName: quota.quotaAllocations[0]?.vessel?.name || 'Unknown',
          utilizationRate,
          remaining,
          message: `Quota is at ${utilizationRate.toFixed(1)}% utilization. Only ${remaining.toFixed(2)} tons remaining.`,
          timestamp: new Date(),
        });
      }

      // Check for expiring soon
      const daysUntilExpiry = Math.ceil((quota.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry <= 30 && remaining > 0) {
        alerts.push({
          id: `${quota.id}-expiring`,
          type: 'warning',
          vesselName: quota.quotaAllocations[0]?.vessel?.name || 'Unknown',
          utilizationRate,
          remaining,
          message: `Quota expires in ${daysUntilExpiry} days with ${remaining.toFixed(2)} tons remaining.`,
          timestamp: new Date(),
        });
      }

      // Check for low balance
      if (remaining <= 10) {
        alerts.push({
          id: `${quota.id}-low-balance`,
          type: 'warning',
          vesselName: quota.quotaAllocations[0]?.vessel?.name || 'Unknown',
          utilizationRate,
          remaining,
          message: `Low quota balance alert: Only ${remaining.toFixed(2)} tons remaining.`,
          timestamp: new Date(),
        });
      }
    });

    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch (error) {
    console.error('Failed to check quota alerts:', error);
    throw error;
  }
}

export async function getQuotaTrends() {
  try {
    const quotas = await db.quota.findMany({
      include: {
        catchRecords: {
          orderBy: {
            landingDate: 'asc'
          }
        },
        quotaAllocations: {
          include: {
            vessel: true,
          },
        },
      },
    });

    const trends = [];
    const startDate = subDays(new Date(), 30);

    for (const quota of quotas) {
      let cumulativeUsage = 0;
      const dailyUsage = [];

      for (let i = 0; i <= 30; i++) {
        const date = addDays(startDate, i);
        const daysCatches = quota.catchRecords.filter(
          (record) => formatDate(record.landingDate, 'yyyy-MM-dd') === formatDate(date, 'yyyy-MM-dd')
        );
        const usage = daysCatches.reduce((sum: number, record) => 
          sum + parseFloat(record.totalCatchMass.toString()), 0);
        cumulativeUsage += usage;

        // Calculate projected usage based on current trend
        const projectedDaily = cumulativeUsage / (i + 1);
        const projectedTotal = projectedDaily * 30;

        dailyUsage.push({
          date: formatDate(date, 'yyyy-MM-dd'),
          usage,
          cumulative: cumulativeUsage,
          projected: projectedTotal,
        });
      }

      trends.push({
        vesselName: quota.quotaAllocations[0]?.vessel?.name || 'Unknown',
        dailyUsage,
      });
    }

    return trends;
  } catch (error) {
    console.error('Failed to get quota trends:', error);
    throw error;
  }
}

export async function getQuotaForecasts(quotaId: string) {
  try {
    const quota = await db.quota.findUnique({
      where: { id: parseInt(quotaId, 10) },
      include: {
        catchRecords: true,
        quotaAllocations: {
          include: {
            vessel: true,
          },
        },
      },
    });

    if (!quota) {
      throw new Error('Quota not found');
    }

    // Get historical catch data
    const catchData = quota.catchRecords.map(record => ({
      date: formatDate(record.landingDate, 'yyyy-MM-dd'),
      amount: parseFloat(record.totalCatchMass.toString()),
    }));

    // Generate forecast using the helper function
    const forecast = await generateQuotaForecast(catchData, {
      historicalDays: 30, // Use last 30 days of data
      daysToForecast: 14, // Forecast next 14 days
      model: 'linear' // Use linear regression model
    });

    return {
      quotaId: quota.id,
      vesselName: quota.quotaAllocations[0]?.vessel?.name || 'Unknown',
      allocated: parseFloat(quota.quotaAllocation.toString()),
      used: parseFloat(quota.quotaUsed.toString()),
      forecast,
    };
  } catch (error) {
    console.error('Failed to generate quota forecast:', error);
    throw error;
  }
}

export async function exportQuotaReport(format: 'csv' | 'pdf' | 'excel' = 'csv') {
  try {
    const quotas = await db.quota.findMany({
      include: {
        catchRecords: true,
        quotaAllocations: {
          include: {
            vessel: true,
          },
        },
      },
    });

    const reportData = quotas.map(quota => {
      const totalCatch = quota.catchRecords.reduce(
        (sum, record) => sum + parseFloat(record.totalCatchMass.toString()),
        0
      );
      const allocated = parseFloat(quota.quotaAllocation.toString());
      const remaining = allocated - totalCatch;
      const utilizationRate = (totalCatch / allocated) * 100;

      return {
        quotaId: String(quota.id),
        vesselName: quota.quotaAllocations[0]?.vessel?.name || 'Unknown',
        allocated,
        used: totalCatch,
        remaining,
        utilizationRate: utilizationRate.toFixed(2) + '%',
        startDate: formatDate(quota.startDate, 'yyyy-MM-dd'),
        endDate: formatDate(quota.endDate, 'yyyy-MM-dd'),
      };
    });

    if (format === 'csv') {
      const fields = ['quotaId', 'vesselName', 'allocated', 'used', 'remaining', 'utilizationRate', 'startDate', 'endDate'];
      return parse(reportData, { fields });
    } else if (format === 'pdf' || format === 'excel') {
      return generateQuotaReport(reportData, { format });
    } else {
      throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error('Failed to export quota report:', error);
    throw error;
  }
}

export async function checkAndSendQuotaAlerts(userEmail: string) {
  try {
    // Get user preferences
    const user = await db.user.findUnique({
      where: { email: userEmail },
      include: {
        preferences: true,
      },
    });

    if (!user || !user.preferences?.emailNotifications) {
      return;
    }

    const quotas = await db.quota.findMany({
      include: {
        catchRecords: true,
        quotaAllocations: {
          include: {
            vessel: true,
          },
        },
      },
    });

    const preferences = user.preferences;
    const warningThreshold = preferences?.quotaWarningThreshold ?? 20;
    const criticalThreshold = preferences?.quotaCriticalThreshold ?? 10;
    const daysBeforeExpiry = preferences?.daysBeforeExpiryWarning ?? 30;

    for (const quota of quotas) {
      const totalCatch = quota.catchRecords.reduce(
        (sum, record) => sum + parseFloat(record.totalCatchMass.toString()),
        0
      );
      const allocated = parseFloat(quota.quotaAllocation.toString());
      const remaining = allocated - totalCatch;
      const utilizationRate = (totalCatch / allocated) * 100;
      const daysUntilExpiry = Math.ceil(
        (quota.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      // Check thresholds and send alerts
      if (
        utilizationRate >= (100 - criticalThreshold) ||
        daysUntilExpiry <= daysBeforeExpiry ||
        remaining <= criticalThreshold
      ) {
        await sendQuotaAlertEmail({
          to: userEmail,
          vesselName: quota.quotaAllocations[0]?.vessel?.name || 'Unknown',
          quotaAmount: allocated,
          remainingAmount: remaining,
          utilizationRate,
          daysUntilExpiry,
        });
      } else if (
        utilizationRate >= (100 - warningThreshold) ||
        remaining <= warningThreshold
      ) {
        await sendQuotaAlertEmail({
          to: userEmail,
          vesselName: quota.quotaAllocations[0]?.vessel?.name || 'Unknown',
          quotaAmount: allocated,
          remainingAmount: remaining,
          utilizationRate,
          daysUntilExpiry,
        });
      }
    }
  } catch (error) {
    console.error('Failed to check and send quota alerts:', error);
    throw error;
  }
}

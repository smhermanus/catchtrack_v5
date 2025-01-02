'use server';

import { db } from '@/lib/db';
import { validateRequest } from '../../../auth';

export async function getVesselStatusData() {
  try {
    const { user } = await validateRequest();

    if (!user || user.role !== 'SYSTEMADMINISTRATOR') {
      throw new Error('Unauthorized');
    }

    const vessels = await db.vessel.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
    });

    return vessels.map((v: { status: string; _count: { _all: number } }) => ({
      status: v.status,
      count: v._count._all,
    }));
  } catch (error) {
    console.error('Failed to fetch vessel status data:', error);
    throw error;
  }
}

export async function getDashboardStats() {
  try {
    const { user } = await validateRequest();

    if (!user || user.role !== 'SYSTEMADMINISTRATOR') {
      throw new Error('Unauthorized');
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const [totalVessels, activeCatches, activeFactories, landingSites, activeQuotas] =
      await Promise.all([
        db.vessel.count(),
        db.catchRecord.count({
          where: {
            landingDate: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        }),
        db.factory.count(),
        db.landingSite.count(),
        db.quota.count({
          where: {
            status: 'VALID',
            endDate: {
              gte: today,
            },
          },
        }),
      ]);

    return {
      totalVessels,
      activeCatches,
      activeFactories,
      landingSites,
      activeQuotas,
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    throw error;
  }
}

export async function getCatchAnalytics() {
  try {
    const { user } = await validateRequest();

    if (!user || user.role !== 'SYSTEMADMINISTRATOR') {
      throw new Error('Unauthorized');
    }

    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const catches = await db.catchRecord.groupBy({
      by: ['landingDate'],
      _sum: {
        totalCatchMass: true,
      },
      where: {
        landingDate: {
          gte: sevenDaysAgo,
          lte: today,
        },
      },
      orderBy: {
        landingDate: 'asc',
      },
    });

    const quotas = await db.quota.groupBy({
      by: ['startDate'],
      _sum: {
        quotaAllocation: true,
      },
      where: {
        startDate: {
          gte: sevenDaysAgo,
          lte: today,
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    // Combine catches and quotas by date
    const combinedData = catches.map((c) => {
      const date = c.landingDate.toISOString().split('T')[0];
      const quota = quotas.find((q) => q.startDate.toISOString().split('T')[0] === date);

      return {
        date,
        totalCatch: Number(c._sum.totalCatchMass || 0),
        quota: Number(quota?._sum.quotaAllocation || 0),
      };
    });

    return combinedData;
  } catch (error) {
    console.error('Failed to fetch catch analytics:', error);
    throw error;
  }
}

export async function getActiveVesselsCount() {
  try {
    const { user } = await validateRequest();

    if (!user || user.role !== 'SYSTEMADMINISTRATOR') {
      throw new Error('Unauthorized');
    }

    const activeVessels = await db.vessel.count({
      where: {
        status: 'ACTIVE',
      },
    });

    return activeVessels;
  } catch (error) {
    console.error('Failed to fetch active vessels count:', error);
    throw error;
  }
}

export async function getPendingNotifications() {
  try {
    const { user } = await validateRequest();

    if (!user || user.role !== 'SYSTEMADMINISTRATOR') {
      throw new Error('Unauthorized');
    }

    const notifications = await db.tripNotification.count({
      where: {
        status: 'PENDING',
      },
    });

    return notifications;
  } catch (error) {
    console.error('Failed to fetch pending notifications:', error);
    throw error;
  }
}

export async function getCatchVsQuota() {
  try {
    const { user } = await validateRequest();

    if (!user || user.role !== 'SYSTEMADMINISTRATOR') {
      throw new Error('Unauthorized');
    }

    const quotas = await db.quota.findMany({
      where: {
        status: 'VALID' as const,
      },
      include: {
        catchRecords: true,
      },
    });

    return quotas.map((quota) => ({
      species: quota.productType,
      catch: Number(quota.quotaUsed),
      quota: Number(quota.quotaAllocation),
      utilization: (Number(quota.quotaUsed) / Number(quota.quotaAllocation)) * 100,
    }));
  } catch (error) {
    console.error('Failed to fetch catch vs quota data:', error);
    throw error;
  }
}

export async function getVesselTrends() {
  try {
    const { user } = await validateRequest();

    if (!user || user.role !== 'SYSTEMADMINISTRATOR') {
      throw new Error('Unauthorized');
    }

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const vessels = await db.vessel.findMany({
      select: {
        status: true,
        lastStatusUpdate: true,
      },
      where: {
        lastStatusUpdate: {
          gte: thirtyDaysAgo,
          lte: today,
        },
      },
      orderBy: {
        lastStatusUpdate: 'asc',
      },
    });

    // Group vessels by date and status
    const groupedData = vessels.reduce(
      (acc: Record<string, { active: number; fishing: number; docked: number }>, curr) => {
        if (!curr.lastStatusUpdate) return acc;

        const date = curr.lastStatusUpdate.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { active: 0, fishing: 0, docked: 0 };
        }

        switch (curr.status.toUpperCase()) {
          case 'ACTIVE':
            acc[date].active++;
            break;
          case 'MAINTENANCE':
          case 'INACTIVE':
            acc[date].fishing++; // Count maintenance and inactive as fishing for trend visualization
            break;
          case 'DOCKED':
            acc[date].docked++;
            break;
        }

        return acc;
      },
      {}
    );

    // Convert to array format for the chart
    return Object.entries(groupedData).map(([date, counts]) => ({
      date,
      ...counts,
    }));
  } catch (error) {
    console.error('Failed to fetch vessel trends:', error);
    throw error;
  }
}

export async function getActiveAlerts() {
  try {
    const { user } = await validateRequest();

    if (!user || user.role !== 'SYSTEMADMINISTRATOR') {
      throw new Error('Unauthorized');
    }

    const alerts = await db.tripNotification.findMany({
      where: {
        status: 'APPROVED',
      },
      include: {
        quota: true,
        vessel: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    return alerts.map((alert) => {
      const quotaUsed = alert.quota.quotaUsed;
      const quotaAllocation = alert.quota.quotaAllocation;
      const utilizationRate = (Number(quotaUsed) / Number(quotaAllocation)) * 100;
      const isHighSeverity = utilizationRate >= 90;

      return {
        id: alert.id.toString(),
        type: 'quota' as const,
        title: `Quota Alert: ${alert.vessel.name}`,
        message: `Quota utilization at ${utilizationRate.toFixed(1)}%`,
        severity: isHighSeverity ? ('high' as const) : ('medium' as const),
        timestamp: alert.createdAt.toISOString(),
      };
    });
  } catch (error) {
    console.error('Failed to fetch active alerts:', error);
    throw error;
  }
}

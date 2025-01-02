import { Metadata } from 'next';
import { validateRequest } from '../../../auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { KPICards } from '@/components/dashboard/admin/analytics/kpi-cards';
import { ClientCatchQuotaChart } from '@/components/dashboard/admin/analytics/client-catch-quota-chart';
import { ClientVesselTrends } from '@/components/dashboard/admin/analytics/client-vessel-trends';
import { ClientAlertSystem } from '@/components/dashboard/admin/analytics/client-alert-system';
import {
  getActiveVesselsCount,
  getPendingNotifications,
  getDashboardStats,
  getCatchVsQuota,
  getVesselTrends,
  getActiveAlerts,
} from './actions';

export const metadata: Metadata = {
  title: 'Admin Dashboard | CatchTrack',
  description: 'CatchTrack administration and monitoring dashboard',
};

function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[60px]" />
            <Skeleton className="h-4 w-[120px] mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[200px]" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[400px] w-full" />
      </CardContent>
    </Card>
  );
}

async function DashboardContent() {
  const [activeVessels, pendingNotifications, stats, catchVsQuota, vesselTrends, alerts] =
    await Promise.all([
      getActiveVesselsCount(),
      getPendingNotifications(),
      getDashboardStats(),
      getCatchVsQuota(),
      getVesselTrends(),
      getActiveAlerts(),
    ]);

  return (
    <div className="space-y-4">
      <KPICards
        activeVessels={activeVessels}
        pendingNotifications={pendingNotifications}
        totalCatches={stats.activeCatches}
        activeQuotas={stats.activeQuotas}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <ClientCatchQuotaChart data={catchVsQuota} />
        <ClientVesselTrends data={vesselTrends} />
      </div>
      <ClientAlertSystem alerts={alerts} />
    </div>
  );
}

export default async function AdminDashboardPage() {
  const { user } = await validateRequest();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'SYSTEMADMINISTRATOR') {
    redirect('/');
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Suspense
        fallback={
          <div className="space-y-4">
            <StatsSkeleton />
            <div className="grid gap-4 md:grid-cols-2">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
            <ChartSkeleton />
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </div>
  );
}

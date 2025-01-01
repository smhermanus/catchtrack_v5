'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, ArrowUpRight, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { useQuotaStats, useLatestQuota } from '../_hooks/use-quotas';
import { RecentSales } from './recent-sales';

export function Overview() {
  const { data: stats, isLoading: statsLoading } = useQuotaStats();
  const { data: recentQuota, isLoading: quotaLoading } = useLatestQuota();

  if (statsLoading || quotaLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Calculate percentages
  const usagePercentage = stats ? (stats.totalUsed / stats.totalAllocation) * 100 : 0;
  const balancePercentage = stats ? (stats.totalBalance / stats.totalAllocation) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Active Quotas</CardTitle>
          <Badge>Active</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalActiveQuotas || 0}</div>
          <p className="text-xs text-muted-foreground">Currently active quotas</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Allocation</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalAllocation.toFixed(2) || '0.00'}</div>
          <Progress value={usagePercentage} className="mt-2" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Used</CardTitle>
          <AlertCircle className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalUsed.toFixed(2) || '0.00'}</div>
          <p className="text-xs text-muted-foreground">
            {usagePercentage.toFixed(1)}% of allocation
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <ChevronUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalBalance.toFixed(2) || '0.00'}</div>
          <p className="text-xs text-muted-foreground">{balancePercentage.toFixed(1)}% remaining</p>
        </CardContent>
      </Card>

      <Card className="col-span-full md:col-span-1">
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentQuota?.alerts?.map((alert) => (
            <Alert
              key={alert.id}
              variant={alert.alertType.includes('WARNING') ? 'warning' : 'default'}
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{alert.alertType.replace(/_/g, ' ')}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>

      <Card className="col-span-full md:col-span-1">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentSales />
        </CardContent>
      </Card>
    </div>
  );
}

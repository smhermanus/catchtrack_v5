import { Metadata } from 'next';
import { MonitoringStats } from '@/components/dashboard/monitor/monitoring-stats';
import Monitor from '../../(monitor)/monitor/_components/MonitorPage';
import React from 'react';

export const metadata: Metadata = {
  title: 'Monitor Dashboard | CatchTrack',
  description: 'CatchTrack monitoring dashboard',
};

export default function MonitorDashboardPage() {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Monitoring Dashboard</h2>
      </div>
      <MonitoringStats />
      <Monitor />
    </div>
  );
}

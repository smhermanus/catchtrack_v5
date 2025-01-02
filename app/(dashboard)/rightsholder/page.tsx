import { Metadata } from 'next';
import { QuotaOverview } from '@/components/dashboard/rightsholder/quota-overview';
import { VesselManagement } from '@/components/dashboard/rightsholder/vessel-management';
import React from 'react';

export const metadata: Metadata = {
  title: 'Rightsholder Dashboard | CatchTrack',
  description: 'CatchTrack rightsholder dashboard',
};

export default function RightsholderDashboardPage() {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Rightsholder Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <QuotaOverview className="col-span-4" />
        <VesselManagement className="col-span-3" />
      </div>
    </div>
  );
}

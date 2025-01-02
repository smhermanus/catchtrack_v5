import { Metadata } from 'next';
import { TripNotification } from '@/components/dashboard/skipper/trip-notification';
import { VesselStatus } from '@/components/dashboard/skipper/vessel-status';
import React from 'react';

export const metadata: Metadata = {
  title: 'Skipper Dashboard | CatchTrack',
  description: 'CatchTrack skipper dashboard',
};

export default function SkipperDashboardPage() {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Skipper Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <VesselStatus className="col-span-4" />
        <TripNotification className="col-span-3" />
      </div>
    </div>
  );
}

import { Metadata } from 'next';
import { CatchForm } from '@/components/dashboard/monitor/catch-form';
import { DataTable } from '@/components/shared/data-table';
import { columns } from './columns';
import React from 'react';

export const metadata: Metadata = {
  title: 'Catch Records | CatchTrack',
  description: 'View and manage catch records',
};

async function getCatchRecords() {
  // TODO: Implement catch records fetching
  return [];
}

export default async function CatchRecordsPage() {
  const records = await getCatchRecords();

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Catch Records</h2>
      </div>
      <div className="space-y-4">
        <CatchForm />
        <DataTable columns={columns} data={records} searchKey="vesselName" />
      </div>
    </div>
  );
}

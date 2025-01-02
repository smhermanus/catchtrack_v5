import { Metadata } from 'next';
import { validateRequest } from '../../../../auth';
import { redirect } from 'next/navigation';
import { DataTable } from '@/components/shared/data-table';
import { columns } from './columns';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { getVessels } from './actions';
import { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

export const metadata: Metadata = {
  title: 'Vessel Management | CatchTrack',
  description: 'Manage fishing vessels and their operations',
};

function TableSkeleton() {
  return (
    <Card>
      <div className="p-4">
        <div className="space-y-4">
          <Skeleton className="h-8 w-[200px]" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

async function VesselTable() {
  const vessels = await getVessels();
  return (
    <DataTable
      columns={columns}
      data={vessels}
      searchKey="name"
      searchPlaceholder="Search vessels..."
    />
  );
}

export default async function VesselsPage() {
  const { user, session } = await validateRequest();

  if (!user || !session) {
    redirect('/login');
  }

  if (user.role !== 'SYSTEMADMINISTRATOR') {
    redirect('/unauthorized');
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vessels</h2>
          <p className="text-muted-foreground">Manage and monitor fishing vessels</p>
        </div>
        <Button asChild>
          <Link href="/admin/vessels/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Vessel
          </Link>
        </Button>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <VesselTable />
      </Suspense>
    </div>
  );
}

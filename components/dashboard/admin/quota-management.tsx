'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/shared/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';

interface Quota {
  id: string;
  species: string;
  totalAllocation: number;
  allocated: number;
  remaining: number;
  status: 'active' | 'pending' | 'expired';
}

const columns: ColumnDef<Quota>[] = [
  {
    accessorKey: 'species',
    header: 'Species',
  },
  {
    accessorKey: 'totalAllocation',
    header: 'Total Allocation (t)',
  },
  {
    accessorKey: 'allocated',
    header: 'Allocated (t)',
  },
  {
    accessorKey: 'remaining',
    header: 'Remaining (t)',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          variant={
            status === 'active'
              ? 'success'
              : status === 'pending'
              ? 'secondary'
              : 'destructive'
          }
        >
          {status}
        </Badge>
      );
    },
  },
];

const sampleData: Quota[] = [
  {
    id: '1',
    species: 'Westcoast Rock Lobster',
    totalAllocation: 1000,
    allocated: 800,
    remaining: 200,
    status: 'active',
  },
  {
    id: '2',
    species: 'Tuna',
    totalAllocation: 500,
    allocated: 300,
    remaining: 200,
    status: 'active',
  },
  {
    id: '3',
    species: 'Sardine',
    totalAllocation: 2000,
    allocated: 2000,
    remaining: 0,
    status: 'expired',
  },
];

export function QuotaManagement() {
  const [quotas] = useState<Quota[]>(sampleData);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quota Allocations</CardTitle>
              <CardDescription>Manage and monitor quota allocations</CardDescription>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Allocation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={quotas} searchKey="species" />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quota</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,500t</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allocated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,100t</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">400t</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Allocations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

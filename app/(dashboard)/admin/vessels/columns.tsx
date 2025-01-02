'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Vessel } from '@prisma/client';
import { deleteVessel, updateVesselStatus } from './actions';
import { toast } from 'sonner';
import React from 'react';

export const columns: ColumnDef<Vessel>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'registrationNumber',
    header: 'Registration',
  },
  {
    accessorKey: 'capacity',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Capacity (tons)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const colorMap: Record<string, string> = {
        ACTIVE: 'bg-green-500',
        INACTIVE: 'bg-red-500',
        MAINTENANCE: 'bg-yellow-500',
        DOCKED: 'bg-blue-500',
      };

      return (
        <Badge variant="outline" className={colorMap[status]}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'lastMaintenance',
    header: 'Last Maintenance',
    cell: ({ row }) => {
      const date = row.getValue('lastMaintenance') as Date;
      return date ? new Date(date).toLocaleDateString() : 'N/A';
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const vessel = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(vessel.id.toString());
                toast.success('Vessel ID copied to clipboard');
              }}
            >
              Copy vessel ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                try {
                  await updateVesselStatus(vessel.id.toString(), 'ACTIVE');
                  toast.success('Vessel activated successfully');
                } catch (error) {
                  toast.error('Failed to activate vessel');
                }
              }}
            >
              Set as Active
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                try {
                  await updateVesselStatus(vessel.id.toString(), 'MAINTENANCE');
                  toast.success('Vessel set to maintenance');
                } catch (error) {
                  toast.error('Failed to update vessel status');
                }
              }}
            >
              Set to Maintenance
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                try {
                  await updateVesselStatus(vessel.id.toString(), 'DOCKED');
                  toast.success('Vessel set as docked');
                } catch (error) {
                  toast.error('Failed to update vessel status');
                }
              }}
            >
              Set as Docked
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={async () => {
                try {
                  await deleteVessel(vessel.id.toString());
                  toast.success('Vessel deleted successfully');
                } catch (error) {
                  toast.error('Failed to delete vessel');
                }
              }}
            >
              Delete vessel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

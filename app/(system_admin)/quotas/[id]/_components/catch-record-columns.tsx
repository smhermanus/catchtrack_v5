'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

export type FormattedCatchRecord = {
  id: string;
  date: string;
  landingSite: string;
  rightsholder: string;
  species: string;
  weight: number;
  grade: string;
  temperature: number | null;
  inspector: string;
  notes: string | null;
};

export const columns: ColumnDef<FormattedCatchRecord>[] = [
  {
    accessorKey: 'date',
    header: 'Date',
  },
  {
    accessorKey: 'landingSite',
    header: 'Landing Site',
  },
  {
    accessorKey: 'rightsholder',
    header: 'Rightsholder',
  },
  {
    accessorKey: 'species',
    header: 'Species',
  },
  {
    accessorKey: 'weight',
    header: 'Weight (kg)',
    cell: ({ row }) => {
      const weight = row.getValue('weight') as number;
      return weight.toLocaleString();
    },
  },
  {
    accessorKey: 'grade',
    header: 'Grade',
    cell: ({ row }) => {
      const grade = row.getValue('grade') as string;
      return <Badge variant="outline">{grade}</Badge>;
    },
  },
  {
    accessorKey: 'temperature',
    header: 'Temp (°C)',
    cell: ({ row }) => {
      const temp = row.getValue('temperature') as number | null;
      return temp ? `${temp}°C` : '-';
    },
  },
  {
    accessorKey: 'inspector',
    header: 'Inspector',
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit record</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Check, X } from 'lucide-react';

export type UserManagement = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  isVerified: boolean;
  lastLogin: string;
  createdAt: string;
};

export const columns: ColumnDef<UserManagement>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      return <Badge variant="outline">{role.replace(/_/g, ' ')}</Badge>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          variant={
            status === 'ACTIVE' ? 'default' : status === 'PENDING' ? 'secondary' : 'destructive'
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'isVerified',
    header: 'Verified',
    cell: ({ row }) => {
      const isVerified = row.getValue('isVerified') as boolean;
      return isVerified ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <X className="w-4 h-4 text-red-500" />
      );
    },
  },
  {
    accessorKey: 'lastLogin',
    header: 'Last Login',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem>View Details</DropdownMenuItem>
            {user.status === 'PENDING' && (
              <>
                <DropdownMenuItem>Approve User</DropdownMenuItem>
                <DropdownMenuItem>Reject User</DropdownMenuItem>
              </>
            )}
            {user.status === 'ACTIVE' && (
              <DropdownMenuItem className="text-red-600">Suspend User</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

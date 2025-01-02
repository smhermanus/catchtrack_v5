import { Metadata } from 'next';
import { DataTable } from '@/components/shared/data-table';
import { columns } from './columns';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { db } from '@/lib/db';
import { validateRequest } from '../../../../auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserRole } from '@prisma/client';
import React from 'react';

export const metadata: Metadata = {
  title: 'User Management | CatchTrack',
  description: 'Manage system users and their roles',
};

async function getUsers() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map((user) => {
      return {
        id: user.id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
        isActive: user.isActive,
      };
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export default async function UsersPage() {
  const { user: currentUser, session } = await validateRequest();

  if (!currentUser || !session || currentUser.role !== 'SYSTEMADMINISTRATOR') {
    redirect('/');
  }

  const users = await getUsers();

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Here you can manage all system users and their roles
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/users/new">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Link>
        </Button>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  );
}

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus, Ship, Scale } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common administrative tasks</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button asChild className="w-full">
          <Link href="/admin/users/new">
            <UserPlus className="mr-2 h-4 w-4" />
            Add New User
          </Link>
        </Button>
        <Button asChild className="w-full">
          <Link href="/admin/quotas/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Quota
          </Link>
        </Button>
        <Button asChild className="w-full">
          <Link href="/admin/vessels/new">
            <Ship className="mr-2 h-4 w-4" />
            Register Vessel
          </Link>
        </Button>
        <Button asChild className="w-full">
          <Link href="/admin/catch-records">
            <Scale className="mr-2 h-4 w-4" />
            View Catch Records
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

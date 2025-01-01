import { Metadata } from 'next';
import { UserForm } from '@/components/dashboard/admin/user-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { validateRequest } from '@/auth';
import { redirect } from 'next/navigation';
import { createUser } from '../actions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { UserRole } from '@prisma/client';

export const metadata: Metadata = {
  title: 'Create User | CatchTrack',
  description: 'Create a new user account',
};

interface CreateUserFormData {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  rsaId: string;
  cellNumber: string;
  physicalAddress: string;
}

export default async function NewUserPage() {
  const { user } = await validateRequest();

  if (!user || user.role !== 'SYSTEMADMINISTRATOR') {
    redirect('/');
  }

  async function handleCreateUser(data: CreateUserFormData) {
    await createUser(data);
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/users">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Create User</h2>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>New User Account</CardTitle>
          <CardDescription>
            Create a new user account with specific role and permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm onSubmit={handleCreateUser} />
        </CardContent>
      </Card>
    </div>
  );
}

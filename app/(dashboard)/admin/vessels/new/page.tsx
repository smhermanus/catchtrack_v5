import { Metadata } from 'next';
import { VesselForm } from '@/components/dashboard/vessels/vessel-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { validateRequest } from '@/auth';
import { redirect } from 'next/navigation';
import { createVessel } from '../actions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Add Vessel | CatchTrack',
  description: 'Register a new fishing vessel',
};

export default async function NewVesselPage() {
  const { user } = await validateRequest();

  if (!user || user.role !== 'SYSTEMADMINISTRATOR') {
    redirect('/');
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/vessels">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Add Vessel</h2>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>New Vessel Registration</CardTitle>
          <CardDescription>Register a new fishing vessel in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <VesselForm onSubmit={createVessel} />
        </CardContent>
      </Card>
    </div>
  );
}

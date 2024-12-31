import { Metadata } from 'next';
import { QuotaForm } from '@/components/dashboard/quotas/quota-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { validateRequest } from '@/auth';
import { redirect } from 'next/navigation';
import { createQuota, QuotaFormData } from '../actions';
import { db } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Add Quota | CatchTrack',
  description: 'Create a new fishing quota',
};

export default async function NewQuotaPage() {
  const { user } = await validateRequest();
  
  if (!user || !['SYSTEMADMINISTRATOR', 'ADMIN'].includes(user.role)) {
    redirect('/');
  }

  const vessels = await db.vessel.findMany({
    select: {
      id: true,
      name: true,
    },
    where: {
      status: 'ACTIVE',
    },
    orderBy: {
      name: 'asc',
    },
  });

  async function handleCreateQuota(data: QuotaFormData) {
    await createQuota(data);
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Create New Quota</h2>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Quota Details</CardTitle>
          <CardDescription>
            Set a new quota for a vessel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuotaForm 
            onSubmit={handleCreateQuota} 
            vessels={vessels.map(vessel => ({ 
              id: String(vessel.id), 
              name: vessel.name 
            }))} 
          />
        </CardContent>
      </Card>
    </div>
  );
}

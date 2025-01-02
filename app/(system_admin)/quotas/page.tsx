import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Overview } from './_components/overview';
import { QuotaList } from './_components/quota-list';
import { ComplianceList } from './_components/compliance-list';
import { TransferList } from './_components/transfer-list';
import React from 'react';

export const metadata: Metadata = {
  title: 'Quota Management',
  description: 'Comprehensive quota management system',
};

export default async function QuotaManagementPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Quota Management</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quotas">Quotas</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Overview />
        </TabsContent>
        <TabsContent value="quotas" className="space-y-4">
          <QuotaList />
        </TabsContent>
        <TabsContent value="compliance" className="space-y-4">
          <ComplianceList />
        </TabsContent>
        <TabsContent value="transfers" className="space-y-4">
          <TransferList />
        </TabsContent>
      </Tabs>
    </div>
  );
}

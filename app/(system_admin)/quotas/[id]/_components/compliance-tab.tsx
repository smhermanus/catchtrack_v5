'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { useComplianceRecords } from '../../_hooks/use-compliance';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { columns, FormattedComplianceRecord } from './compliance-columns';
import { ComplianceForm } from './compliance-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ComplianceTabProps {
  id: string;
}

export function ComplianceTab({ id }: ComplianceTabProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { data: complianceRecords = [], isLoading } = useComplianceRecords(id);

  const formattedRecords: FormattedComplianceRecord[] = complianceRecords.map((record) => ({
    id: record.id.toString(),
    date: format(new Date(record.reportedAt), 'PPP'),
    type: record.violationType,
    status: record.status,
    description: record.description,
    inspector: record.reporter.firstName + ' ' + record.reporter.lastName,
    actions: record.actions || [],
    documents: record.documents || [],
  }));

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Compliance Records</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Record
        </Button>
      </div>

      <DataTable columns={columns} data={formattedRecords} loading={isLoading} searchKey="type" />

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Compliance Record</DialogTitle>
          </DialogHeader>
          <ComplianceForm quotaId={id} onSuccess={() => setIsCreating(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

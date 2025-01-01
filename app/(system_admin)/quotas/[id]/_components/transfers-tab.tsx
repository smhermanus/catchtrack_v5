'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { useTransfers } from '../../_hooks/use-transfers';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './transfer-columns';
import { TransferForm } from './transfer-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormattedTransfer } from '../../_types';

interface TransfersTabProps {
  id: string;
}

export function TransfersTab({ id }: TransfersTabProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { data: transfers = [], isLoading } = useTransfers(id);

  const formattedTransfers: FormattedTransfer[] = transfers.map((transfer) => ({
    id: transfer.id.toString(),
    date: format(new Date(transfer.date), 'PPP'),
    type: transfer.transferType,
    status: transfer.status,
    amount: Number(transfer.amount),
    fromRightsholder: transfer.fromRightsholder.companyName,
    toRightsholder: transfer.toRightsholder.companyName,
    approvedBy: transfer.approver
      ? `${transfer.approver.firstName} ${transfer.approver.lastName}`
      : undefined,
    notes: transfer.notes || undefined,
    documents: transfer.documents.map((doc) => ({
      ...doc,
      id: doc.id.toString(),
    })),
  }));

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Quota Transfers</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Transfer
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={formattedTransfers}
        loading={isLoading}
        searchKey="fromRightsholder"
      />

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Transfer</DialogTitle>
          </DialogHeader>
          <TransferForm quotaId={id} onSuccess={() => setIsCreating(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

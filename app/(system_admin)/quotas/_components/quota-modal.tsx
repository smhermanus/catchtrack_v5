'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { QuotaForm } from './quota-form';

interface QuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export function QuotaModal({ isOpen, onClose, initialData }: QuotaModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Quota' : 'Create New Quota'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Make changes to the existing quota' : 'Create a new quota allocation'}
          </DialogDescription>
        </DialogHeader>
        <QuotaForm initialData={initialData} onSuccess={onClose} />
      </DialogContent>
    </Dialog>
  );
}

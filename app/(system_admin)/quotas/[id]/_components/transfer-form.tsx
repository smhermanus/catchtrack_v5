'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateTransfer } from '../../_hooks/use-transfers';
import { toast } from 'sonner';

const formSchema = z.object({
  destinationQuotaId: z.string({
    required_error: 'Please enter the destination quota ID',
  }),
  amount: z.coerce
    .number()
    .min(0.01, 'Amount must be greater than 0')
    .max(1000000, 'Amount cannot exceed 1,000,000'),
  reason: z.string().min(1, 'Reason is required'),
});

interface TransferFormProps {
  quotaId: string;
  onSuccess: () => void;
}

export function TransferForm({ quotaId, onSuccess }: TransferFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const createTransfer = useCreateTransfer();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      reason: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      await createTransfer.mutateAsync({
        quotaId,
        data: values,
      });
      toast.success('Transfer request created successfully');
      onSuccess();
    } catch (error) {
      toast.error('Failed to create transfer request');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="destinationQuotaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination Quota ID</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder="Enter the destination quota ID"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (kg)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  disabled={isLoading}
                  placeholder="Enter the transfer amount"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Transfer</FormLabel>
              <FormControl>
                <Textarea
                  disabled={isLoading}
                  placeholder="Provide a reason for the transfer"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onSuccess} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            Create Transfer
          </Button>
        </div>
      </form>
    </Form>
  );
}

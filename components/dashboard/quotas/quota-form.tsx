'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { QuotaFormData } from '@/app/(dashboard)/admin/quotas/actions';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const quotaFormSchema = z.object({
  vesselId: z.string().min(1, {
    message: 'Vessel is required.',
  }),
  amount: z.coerce.number().min(0, {
    message: 'Amount must be a positive number.',
  }),
  startDate: z.date({
    required_error: 'Start date is required.',
  }),
  endDate: z.date({
    required_error: 'End date is required.',
  }),
  notes: z.string().optional(),
});

interface QuotaFormProps {
  onSubmit: (data: QuotaFormData) => Promise<void>;
  initialData?: Partial<QuotaFormData>;
  vessels: { id: string; name: string }[];
}

export function QuotaForm({ onSubmit, initialData, vessels }: QuotaFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<QuotaFormData>({
    resolver: zodResolver(quotaFormSchema),
    defaultValues: initialData || {
      amount: 0,
      notes: '',
    },
  });

  async function handleSubmit(data: QuotaFormData) {
    try {
      setIsLoading(true);
      await onSubmit(data);
      form.reset();
      toast.success('Quota saved successfully');
    } catch (error) {
      toast.error('Failed to save quota');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="vesselId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vessel</FormLabel>
              <FormControl>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  {...field}
                >
                  <option value="">Select a vessel</option>
                  {vessels.map((vessel) => (
                    <option key={vessel.id} value={vessel.id}>
                      {vessel.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormDescription>Select the vessel for this quota</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (tons)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter quota amount" {...field} />
              </FormControl>
              <FormDescription>Maximum allowed catch in tons</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-[240px] pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date: Date | undefined) => field.onChange(date)}
                    disabled={(date: Date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>When the quota period starts</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>End Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-[240px] pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date: Date | undefined) => field.onChange(date)}
                    disabled={(date: Date) => date < form.getValues('startDate')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>When the quota period ends</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  rows={3}
                  placeholder="Enter any additional notes"
                  {...field}
                />
              </FormControl>
              <FormDescription>Optional notes about this quota</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Quota'}
        </Button>
      </form>
    </Form>
  );
}

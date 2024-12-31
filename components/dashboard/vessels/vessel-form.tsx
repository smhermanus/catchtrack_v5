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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const vesselFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }).max(100),
  registrationNumber: z.string().min(2, {
    message: 'Registration number is required.',
  }).max(50),
  vesselType: z.string().min(2, {
    message: 'Vessel type is required.',
  }).max(50),
  rightsholderId: z.number().int().positive(),
});

type VesselFormData = z.infer<typeof vesselFormSchema>;

interface VesselFormProps {
  onSubmit: (data: VesselFormData) => Promise<any>;
  initialData?: Partial<VesselFormData>;
}

export function VesselForm({ onSubmit, initialData }: VesselFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<VesselFormData>({
    resolver: zodResolver(vesselFormSchema),
    defaultValues: initialData || {
      name: '',
      registrationNumber: '',
      vesselType: '',
      rightsholderId: 0,
    },
  });

  async function handleSubmit(data: VesselFormData) {
    try {
      setIsLoading(true);
      await onSubmit(data);
      form.reset();
      toast.success('Vessel saved successfully');
    } catch (error) {
      toast.error('Failed to save vessel');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vessel Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter vessel name" {...field} />
              </FormControl>
              <FormDescription>
                The name of the vessel
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="registrationNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registration Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter registration number" {...field} />
              </FormControl>
              <FormDescription>
                Official registration number of the vessel
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="vesselType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vessel Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vessel type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="TRAWLER">Trawler</SelectItem>
                  <SelectItem value="LONGLINER">Longliner</SelectItem>
                  <SelectItem value="PURSE_SEINER">Purse Seiner</SelectItem>
                  <SelectItem value="POLE_AND_LINE">Pole and Line</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Type of the vessel
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rightsholderId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rightsholder ID</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  placeholder="Enter rightsholder ID"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription>
                ID of the rightsholder who owns this vessel
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Vessel'}
        </Button>
      </form>
    </Form>
  );
}

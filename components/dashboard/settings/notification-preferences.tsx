'use client';

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { updateNotificationPreferences } from '@/app/(dashboard)/settings/notifications/actions';
import React from 'react';

const notificationPreferencesSchema = z.object({
  quotaWarningThreshold: z.coerce.number().min(1).max(100),
  quotaCriticalThreshold: z.coerce.number().min(1).max(100),
  daysBeforeExpiryWarning: z.coerce.number().min(1).max(365),
  emailNotifications: z.boolean(),
  dailyDigest: z.boolean(),
  weeklyReport: z.boolean(),
});

type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;

interface NotificationPreferencesProps {
  userId: string;
}

export function NotificationPreferences({ userId }: NotificationPreferencesProps) {
  const form = useForm<NotificationPreferences>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: {
      quotaWarningThreshold: 75,
      quotaCriticalThreshold: 90,
      daysBeforeExpiryWarning: 30,
      emailNotifications: true,
      dailyDigest: false,
      weeklyReport: true,
    },
  });

  async function onSubmit(data: NotificationPreferences) {
    try {
      await updateNotificationPreferences(userId, data);
      toast.success('Notification preferences updated');
    } catch {
      toast.error('Failed to update notification preferences');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quota Alerts</CardTitle>
            <CardDescription>
              Configure when you want to receive alerts about your quotas
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="quotaWarningThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warning Threshold (%)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Receive warnings when quota utilization reaches this percentage
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quotaCriticalThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Critical Threshold (%)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Receive critical alerts when quota utilization reaches this percentage
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="daysBeforeExpiryWarning"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Warning (Days)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Get notified this many days before a quota expires
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Delivery</CardTitle>
            <CardDescription>Choose how you want to receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="emailNotifications"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Email Notifications</FormLabel>
                    <FormDescription>Receive notifications via email</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dailyDigest"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Daily Digest</FormLabel>
                    <FormDescription>Receive a daily summary of your quota usage</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weeklyReport"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Weekly Report</FormLabel>
                    <FormDescription>Receive detailed weekly reports and forecasts</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button type="submit">Save preferences</Button>
      </form>
    </Form>
  );
}

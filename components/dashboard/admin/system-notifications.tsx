'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SystemNotification {
  id: string;
  type: 'error' | 'warning' | 'success';
  title: string;
  description: string;
  timestamp: string;
}

const notifications: SystemNotification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Quota Alert',
    description: 'Hake quota usage at 85% - consider reviewing allocations',
    timestamp: '10 minutes ago',
  },
  {
    id: '2',
    type: 'error',
    title: 'System Error',
    description: 'Database backup failed - check system logs',
    timestamp: '1 hour ago',
  },
  {
    id: '3',
    type: 'success',
    title: 'Backup Complete',
    description: 'Daily system backup completed successfully',
    timestamp: '2 hours ago',
  },
  {
    id: '4',
    type: 'warning',
    title: 'Performance Alert',
    description: 'High system load detected in the last hour',
    timestamp: '3 hours ago',
  },
];

export function SystemNotifications() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Notifications</CardTitle>
        <CardDescription>Recent system alerts and notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Alert
                key={notification.id}
                variant={notification.type === 'error' ? 'destructive' : 'default'}
                className={
                  notification.type === 'success' ? 'border-green-500 text-green-700' : undefined
                }
              >
                {notification.type === 'error' && <AlertCircle className="h-4 w-4" />}
                {notification.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                {notification.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                <div>
                  <AlertTitle className="flex items-center justify-between">
                    <span>{notification.title}</span>
                    <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                  </AlertTitle>
                  <AlertDescription>{notification.description}</AlertDescription>
                </div>
              </Alert>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

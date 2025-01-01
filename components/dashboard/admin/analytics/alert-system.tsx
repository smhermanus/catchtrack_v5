'use client';

import { AlertTriangle, Bell, Scale, Ship } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Alert } from './types';

interface AlertSystemProps {
  alerts: Alert[];
}

export function AlertSystem({ alerts }: AlertSystemProps) {
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'quota':
        return <Scale className="h-4 w-4" />;
      case 'vessel':
        return <Ship className="h-4 w-4" />;
      case 'system':
        return <Bell className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
        <AlertTriangle className="h-4 w-4 text-amber-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active alerts</p>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-4 rounded-lg border p-4">
                <div className="flex-shrink-0">{getAlertIcon(alert.type)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <Badge className={cn('ml-2', getSeverityColor(alert.severity))}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

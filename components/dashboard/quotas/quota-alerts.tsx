'use client';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

interface QuotaAlert {
  id: string;
  vesselName: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: Date;
}

interface QuotaAlertsProps {
  alerts: QuotaAlert[];
}

export function QuotaAlerts({ alerts }: QuotaAlertsProps) {
  const getAlertIcon = (type: QuotaAlert['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'critical':
        return <AlertCircle className="h-4 w-4" />;
      case 'info':
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (type: QuotaAlert['type']) => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'critical':
        return 'destructive';
      case 'info':
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quota Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active alerts</p>
        ) : (
          alerts.map((alert) => (
            <Alert
              key={alert.id}
              variant={getAlertVariant(alert.type)}
            >
              <div className="flex items-start gap-4">
                {getAlertIcon(alert.type)}
                <div className="grid gap-1">
                  <AlertTitle>{alert.vesselName}</AlertTitle>
                  <AlertDescription>
                    <div className="grid gap-1">
                      <p>{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {alert.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))
        )}
      </CardContent>
    </Card>
  );
}

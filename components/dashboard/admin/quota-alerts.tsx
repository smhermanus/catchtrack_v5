'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function QuotaAlerts() {
  return (
    <div className="space-y-4">
      <Alert variant="warning">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          4 vessels are approaching their quota limits. Review needed.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>2 vessels have exceeded their daily catch limit.</AlertDescription>
      </Alert>
    </div>
  );
}

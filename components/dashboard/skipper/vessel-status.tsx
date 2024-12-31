'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type VesselStatusProps = React.HTMLAttributes<HTMLDivElement>;

export function VesselStatus({ className, ...props }: VesselStatusProps) {
  return (
    <Card className={cn('', className)} {...props}>
      <CardHeader>
        <CardTitle>Vessel Status</CardTitle>
        <CardDescription>Current vessel information and status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Vessel Name</p>
              <p className="text-lg font-medium">Ocean Explorer</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant="success" className="mt-1">At Sea</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Location</p>
              <p className="text-lg font-medium">34°S 18°E</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Trip Duration</p>
              <p className="text-lg font-medium">3d 12h</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Quota Remaining</p>
            <div className="h-2 bg-secondary rounded-full">
              <div className="h-2 bg-primary rounded-full" style={{ width: '65%' }} />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>Used: 35t</span>
              <span>Total: 100t</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

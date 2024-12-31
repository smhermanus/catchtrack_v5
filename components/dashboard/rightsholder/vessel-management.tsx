'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Ship } from 'lucide-react';

type VesselManagementProps = React.HTMLAttributes<HTMLDivElement>;

const vessels = [
  { id: 1, name: 'Ocean Explorer', status: 'active', location: '34°S 18°E' },
  { id: 2, name: 'Sea Voyager', status: 'docked', location: 'Cape Town Harbor' },
  { id: 3, name: 'Atlantic Fisher', status: 'maintenance', location: 'Port Repair' },
];

export function VesselManagement({ className, ...props }: VesselManagementProps) {
  return (
    <Card className={cn('', className)} {...props}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Vessel Management</CardTitle>
            <CardDescription>Monitor your vessel fleet</CardDescription>
          </div>
          <Button size="sm">
            <Ship className="mr-2 h-4 w-4" />
            Add Vessel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {vessels.map((vessel) => (
            <div
              key={vessel.id}
              className="flex items-center justify-between p-2 border rounded-lg"
            >
              <div>
                <p className="font-medium">{vessel.name}</p>
                <p className="text-sm text-muted-foreground">{vessel.location}</p>
              </div>
              <Badge
                variant={
                  vessel.status === 'active'
                    ? 'success'
                    : vessel.status === 'docked'
                    ? 'secondary'
                    : 'destructive'
                }
              >
                {vessel.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

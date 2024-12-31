'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type TripNotificationProps = React.HTMLAttributes<HTMLDivElement>;

export function TripNotification({ className, ...props }: TripNotificationProps) {
  const [isStarting, setIsStarting] = useState(false);

  const handleTripStart = async () => {
    setIsStarting(true);
    try {
      // TODO: Implement trip start logic
      console.log('Starting trip...');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Card className={cn('', className)} {...props}>
      <CardHeader>
        <CardTitle>Trip Notification</CardTitle>
        <CardDescription>Manage your fishing trip status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Current Trip Status</p>
            <p className="text-lg font-medium">In Progress</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Last Update</p>
            <p className="text-lg font-medium">2 hours ago</p>
          </div>
        </div>
        <div className="space-y-2">
          <Button 
            className="w-full" 
            variant="default"
            disabled={isStarting}
            onClick={handleTripStart}
          >
            {isStarting ? 'Starting Trip...' : 'Start New Trip'}
          </Button>
          <Button className="w-full" variant="outline">
            End Current Trip
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

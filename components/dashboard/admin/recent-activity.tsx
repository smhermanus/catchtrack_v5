'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Activity {
  id: string;
  user: {
    name: string;
    image?: string;
  };
  action: string;
  target: string;
  timestamp: string;
}

const recentActivities: Activity[] = [
  {
    id: '1',
    user: {
      name: 'John Doe',
      image: '/avatars/01.png',
    },
    action: 'created',
    target: 'new catch record',
    timestamp: '2 minutes ago',
  },
  {
    id: '2',
    user: {
      name: 'Jane Smith',
      image: '/avatars/02.png',
    },
    action: 'updated',
    target: 'vessel status',
    timestamp: '5 minutes ago',
  },
  {
    id: '3',
    user: {
      name: 'Mike Johnson',
      image: '/avatars/03.png',
    },
    action: 'allocated',
    target: 'new quota',
    timestamp: '10 minutes ago',
  },
  {
    id: '4',
    user: {
      name: 'Sarah Wilson',
      image: '/avatars/04.png',
    },
    action: 'approved',
    target: 'catch record',
    timestamp: '15 minutes ago',
  },
  {
    id: '5',
    user: {
      name: 'Tom Brown',
      image: '/avatars/05.png',
    },
    action: 'registered',
    target: 'new vessel',
    timestamp: '20 minutes ago',
  },
];

export function RecentActivity() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest actions performed in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 rounded-lg border p-4"
              >
                <Avatar>
                  <AvatarImage src={activity.user.image} />
                  <AvatarFallback>
                    {activity.user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.user.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.action} {activity.target}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {activity.timestamp}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

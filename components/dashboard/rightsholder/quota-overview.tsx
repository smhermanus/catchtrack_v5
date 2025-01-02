'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import React from 'react';

type QuotaOverviewProps = React.HTMLAttributes<HTMLDivElement>;

const data = [
  { species: 'Hake', allocated: 100, used: 65 },
  { species: 'Tuna', allocated: 80, used: 45 },
  { species: 'Sardine', allocated: 120, used: 90 },
];

export function QuotaOverview({ className, ...props }: QuotaOverviewProps) {
  return (
    <Card className={cn('', className)} {...props}>
      <CardHeader>
        <CardTitle>Quota Overview</CardTitle>
        <CardDescription>Current quota allocation and usage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="species" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="allocated" name="Allocated" fill="#93c5fd" />
              <Bar dataKey="used" name="Used" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Allocation</span>
            <span className="font-medium">300t</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Used</span>
            <span className="font-medium">200t (66.7%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

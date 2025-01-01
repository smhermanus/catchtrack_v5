'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ship, Fish, Factory, MapPin } from 'lucide-react';

interface StatsCardsProps {
  totalVessels: number;
  activeCatches: number;
  activeFactories: number;
  landingSites: number;
}

export function StatsCards({
  totalVessels,
  activeCatches,
  activeFactories,
  landingSites,
}: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Vessels</CardTitle>
          <Ship className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalVessels}</div>
          <p className="text-xs text-muted-foreground">Registered vessels in system</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Catches</CardTitle>
          <Fish className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCatches}</div>
          <p className="text-xs text-muted-foreground">Ongoing catch operations</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Factories</CardTitle>
          <Factory className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeFactories}</div>
          <p className="text-xs text-muted-foreground">Operating processing facilities</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Landing Sites</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{landingSites}</div>
          <p className="text-xs text-muted-foreground">Active landing locations</p>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { VesselTrends } from './vessel-trends';
import { VesselTrendData } from './types';

interface ClientVesselTrendsProps {
  data: VesselTrendData[];
}

export function ClientVesselTrends({ data }: ClientVesselTrendsProps) {
  return <VesselTrends data={data} />;
}

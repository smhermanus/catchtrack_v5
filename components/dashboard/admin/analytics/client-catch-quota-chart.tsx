'use client';

import { CatchQuotaChart } from './catch-quota-chart';
import { CatchData } from './types';

interface ClientCatchQuotaChartProps {
  data: CatchData[];
}

export function ClientCatchQuotaChart({ data }: ClientCatchQuotaChartProps) {
  return <CatchQuotaChart data={data} />;
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from 'recharts';
import { useTheme } from 'next-themes';

interface QuotaAnalyticsData {
  vesselName: string;
  allocated: number;
  used: number;
  remaining: number;
  utilizationRate: number;
}

interface QuotaAnalyticsProps {
  data: QuotaAnalyticsData[];
}

export function QuotaAnalytics({ data }: QuotaAnalyticsProps) {
  const { theme } = useTheme();

  const chartColors = {
    allocated: theme === 'dark' ? '#60a5fa' : '#2563eb',
    used: theme === 'dark' ? '#ef4444' : '#dc2626',
    remaining: theme === 'dark' ? '#22c55e' : '#16a34a',
    utilization: theme === 'dark' ? '#f59e0b' : '#d97706',
    grid: theme === 'dark' ? '#374151' : '#e5e7eb',
    text: theme === 'dark' ? '#9ca3af' : '#6b7280',
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Quota Utilization by Vessel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis
                dataKey="vesselName"
                stroke={chartColors.text}
                tick={{ fill: chartColors.text }}
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis
                yAxisId="left"
                stroke={chartColors.text}
                tick={{ fill: chartColors.text }}
                label={{
                  value: 'Quota (tons)',
                  angle: -90,
                  position: 'insideLeft',
                  fill: chartColors.text,
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke={chartColors.text}
                tick={{ fill: chartColors.text }}
                label={{
                  value: 'Utilization Rate (%)',
                  angle: 90,
                  position: 'insideRight',
                  fill: chartColors.text,
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  borderColor: chartColors.grid,
                }}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="allocated"
                fill={chartColors.allocated}
                name="Allocated Quota"
              />
              <Bar yAxisId="left" dataKey="used" fill={chartColors.used} name="Used Quota" />
              <Bar
                yAxisId="left"
                dataKey="remaining"
                fill={chartColors.remaining}
                name="Remaining Quota"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="utilizationRate"
                stroke={chartColors.utilization}
                name="Utilization Rate (%)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

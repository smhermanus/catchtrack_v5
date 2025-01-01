'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from 'next-themes';

interface CatchData {
  date: string;
  totalCatch: number;
  quota: number;
}

interface CatchAnalyticsProps {
  data: CatchData[];
  title?: string;
  description?: string;
}

export function CatchAnalytics({
  data,
  title = 'Catch Analytics',
  description = 'Daily catch records vs quota allocation',
}: CatchAnalyticsProps) {
  const { theme } = useTheme();

  const chartColors = {
    catch: theme === 'dark' ? '#60a5fa' : '#2563eb',
    quota: theme === 'dark' ? '#6b7280' : '#9ca3af',
    grid: theme === 'dark' ? '#374151' : '#e5e7eb',
    text: theme === 'dark' ? '#9ca3af' : '#6b7280',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="date" stroke={chartColors.text} tick={{ fill: chartColors.text }} />
              <YAxis stroke={chartColors.text} tick={{ fill: chartColors.text }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  borderColor: chartColors.grid,
                  color: chartColors.text,
                }}
              />
              <Legend />
              <Bar dataKey="totalCatch" fill={chartColors.catch} name="Total Catch" />
              <Bar dataKey="quota" fill={chartColors.quota} name="Quota" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

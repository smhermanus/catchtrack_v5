'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { useTheme } from 'next-themes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';

interface DailyUsage {
  date: string;
  usage: number;
  cumulative: number;
  projected: number;
}

interface TrendData {
  vesselName: string;
  dailyUsage: DailyUsage[];
}

interface QuotaDetailedAnalyticsProps {
  trends: TrendData[];
  onExport: () => void;
}

export function QuotaDetailedAnalytics({ trends, onExport }: QuotaDetailedAnalyticsProps) {
  const { theme } = useTheme();

  const chartColors = {
    usage: theme === 'dark' ? '#60a5fa' : '#2563eb',
    cumulative: theme === 'dark' ? '#22c55e' : '#16a34a',
    projected: theme === 'dark' ? '#f59e0b' : '#d97706',
    grid: theme === 'dark' ? '#374151' : '#e5e7eb',
    text: theme === 'dark' ? '#9ca3af' : '#6b7280',
  };

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Detailed Quota Analytics</CardTitle>
        <button
          onClick={onExport}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
        >
          Export Report
        </button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" className="space-y-4">
          <TabsList>
            <TabsTrigger value="daily">Daily Usage</TabsTrigger>
            <TabsTrigger value="cumulative">Cumulative Usage</TabsTrigger>
            <TabsTrigger value="forecast">Usage Forecast</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends[0]?.dailyUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis
                  dataKey="date"
                  stroke={chartColors.text}
                  tick={{ fill: chartColors.text }}
                  tickFormatter={(value) => format(new Date(value), 'MMM d')}
                />
                <YAxis
                  stroke={chartColors.text}
                  tick={{ fill: chartColors.text }}
                  label={{ value: 'Daily Usage (tons)', angle: -90, position: 'insideLeft', fill: chartColors.text }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    borderColor: chartColors.grid,
                  }}
                  labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="usage"
                  stroke={chartColors.usage}
                  fill={chartColors.usage}
                  fillOpacity={0.3}
                  name="Daily Usage"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="cumulative" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends[0]?.dailyUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis
                  dataKey="date"
                  stroke={chartColors.text}
                  tick={{ fill: chartColors.text }}
                  tickFormatter={(value) => format(new Date(value), 'MMM d')}
                />
                <YAxis
                  stroke={chartColors.text}
                  tick={{ fill: chartColors.text }}
                  label={{ value: 'Cumulative Usage (tons)', angle: -90, position: 'insideLeft', fill: chartColors.text }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    borderColor: chartColors.grid,
                  }}
                  labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  stroke={chartColors.cumulative}
                  name="Cumulative Usage"
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="forecast" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends[0]?.dailyUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis
                  dataKey="date"
                  stroke={chartColors.text}
                  tick={{ fill: chartColors.text }}
                  tickFormatter={(value) => format(new Date(value), 'MMM d')}
                />
                <YAxis
                  stroke={chartColors.text}
                  tick={{ fill: chartColors.text }}
                  label={{ value: 'Usage (tons)', angle: -90, position: 'insideLeft', fill: chartColors.text }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    borderColor: chartColors.grid,
                  }}
                  labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  stroke={chartColors.cumulative}
                  name="Actual Usage"
                />
                <Line
                  type="monotone"
                  dataKey="projected"
                  stroke={chartColors.projected}
                  strokeDasharray="5 5"
                  name="Projected Usage"
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

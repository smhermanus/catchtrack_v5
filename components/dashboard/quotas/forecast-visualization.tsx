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
  Brush,
  ReferenceLine,
} from 'recharts';
import { useTheme } from 'next-themes';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ForecastData {
  date: string;
  actual?: number;
  linear?: number;
  exponential?: number;
  movingAverage?: number;
  holtWinters?: number;
  seasonal?: number;
  changePoint?: number;
}

interface ForecastVisualizationProps {
  data: ForecastData[];
  quotaLimit: number;
  onModelSelect: (model: string) => void;
}

export function ForecastVisualization({
  data,
  quotaLimit,
  onModelSelect,
}: ForecastVisualizationProps) {
  const { theme } = useTheme();

  const chartColors = {
    actual: theme === 'dark' ? '#60a5fa' : '#2563eb',
    linear: theme === 'dark' ? '#ef4444' : '#dc2626',
    exponential: theme === 'dark' ? '#22c55e' : '#16a34a',
    movingAverage: theme === 'dark' ? '#f59e0b' : '#d97706',
    holtWinters: theme === 'dark' ? '#8b5cf6' : '#7c3aed',
    seasonal: theme === 'dark' ? '#ec4899' : '#db2777',
    changePoint: theme === 'dark' ? '#06b6d4' : '#0891b2',
    grid: theme === 'dark' ? '#374151' : '#e5e7eb',
    text: theme === 'dark' ? '#9ca3af' : '#6b7280',
  };

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Quota Usage Forecast</CardTitle>
        <Select onValueChange={onModelSelect}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linear">Linear Regression</SelectItem>
            <SelectItem value="exponential">Exponential Smoothing</SelectItem>
            <SelectItem value="movingAverage">Moving Average</SelectItem>
            <SelectItem value="holtWinters">Holt-Winters</SelectItem>
            <SelectItem value="seasonal">Seasonal Decomposition</SelectItem>
            <SelectItem value="changePoint">Change Point Detection</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Models</TabsTrigger>
            <TabsTrigger value="comparison">Model Comparison</TabsTrigger>
            <TabsTrigger value="error">Error Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  label={{
                    value: 'Usage (tons)',
                    angle: -90,
                    position: 'insideLeft',
                    fill: chartColors.text,
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    borderColor: chartColors.grid,
                  }}
                  labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                />
                <Legend />
                <ReferenceLine y={quotaLimit} stroke="red" strokeDasharray="3 3" label="Quota Limit" />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke={chartColors.actual}
                  name="Actual Usage"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="linear"
                  stroke={chartColors.linear}
                  name="Linear"
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="exponential"
                  stroke={chartColors.exponential}
                  name="Exponential"
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="movingAverage"
                  stroke={chartColors.movingAverage}
                  name="Moving Avg"
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="holtWinters"
                  stroke={chartColors.holtWinters}
                  name="Holt-Winters"
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="seasonal"
                  stroke={chartColors.seasonal}
                  name="Seasonal"
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="changePoint"
                  stroke={chartColors.changePoint}
                  name="Change Point"
                  strokeDasharray="5 5"
                />
                <Brush
                  dataKey="date"
                  height={30}
                  stroke={chartColors.grid}
                  tickFormatter={(value) => format(new Date(value), 'MMM d')}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="comparison" className="h-[500px]">
            {/* Add model comparison visualization */}
          </TabsContent>

          <TabsContent value="error" className="h-[500px]">
            {/* Add error analysis visualization */}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

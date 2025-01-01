'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const catchData = [
  { month: 'Jan', totalCatch: 4000, quota: 5000 },
  { month: 'Feb', totalCatch: 3500, quota: 5000 },
  { month: 'Mar', totalCatch: 4500, quota: 5000 },
  { month: 'Apr', totalCatch: 3800, quota: 5000 },
];

export function CatchQuotaChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Catch vs Quota Utilization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={catchData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalCatch" fill="#2563eb" name="Total Catch" />
              <Bar dataKey="quota" fill="#9ca3af" name="Quota" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

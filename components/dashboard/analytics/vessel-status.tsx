'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTheme } from 'next-themes';

interface VesselStatusData {
  status: string;
  count: number;
}

interface VesselStatusProps {
  data: VesselStatusData[];
  title?: string;
  description?: string;
}

export function VesselStatus({ 
  data, 
  title = "Vessel Status", 
  description = "Current vessel activity status" 
}: VesselStatusProps) {
  const { theme } = useTheme();

  const COLORS = {
    ACTIVE: theme === 'dark' ? '#22c55e' : '#16a34a',
    INACTIVE: theme === 'dark' ? '#ef4444' : '#dc2626',
    MAINTENANCE: theme === 'dark' ? '#f59e0b' : '#d97706',
    DOCKED: theme === 'dark' ? '#6b7280' : '#9ca3af',
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
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.status as keyof typeof COLORS]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                  color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

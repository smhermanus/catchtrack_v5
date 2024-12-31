'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const vesselActivity = [
  { day: 'Mon', active: 24 },
  { day: 'Tue', active: 28 },
  { day: 'Wed', active: 32 },
  { day: 'Thu', active: 25 },
  { day: 'Fri', active: 30 },
];

export function VesselActivityChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Vessels Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={vesselActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="active" 
                stroke="#2563eb" 
                name="Active Vessels"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";

interface VesselActivity {
  date: string;
  active: number;
  fishing: number;
  docked: number;
}

interface VesselTrendsProps {
  data: VesselActivity[];
}

export function VesselTrends({ data }: VesselTrendsProps) {
  const { theme } = useTheme();

  const chartColors = {
    active: theme === "dark" ? "#22c55e" : "#16a34a",
    fishing: theme === "dark" ? "#60a5fa" : "#2563eb",
    docked: theme === "dark" ? "#6b7280" : "#9ca3af",
    grid: theme === "dark" ? "#374151" : "#e5e7eb",
    text: theme === "dark" ? "#9ca3af" : "#6b7280",
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Vessel Activity Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis
                dataKey="date"
                stroke={chartColors.text}
                tick={{ fill: chartColors.text }}
                tickFormatter={(value) => format(new Date(value), "MMM d")}
              />
              <YAxis
                stroke={chartColors.text}
                tick={{ fill: chartColors.text }}
                label={{
                  value: "Number of Vessels",
                  angle: -90,
                  position: "insideLeft",
                  fill: chartColors.text,
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                  borderColor: chartColors.grid,
                }}
                labelFormatter={(value) => format(new Date(value), "MMM d, yyyy")}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="active"
                stackId="1"
                stroke={chartColors.active}
                fill={chartColors.active}
                name="Active"
              />
              <Area
                type="monotone"
                dataKey="fishing"
                stackId="1"
                stroke={chartColors.fishing}
                fill={chartColors.fishing}
                name="Fishing"
              />
              <Area
                type="monotone"
                dataKey="docked"
                stackId="1"
                stroke={chartColors.docked}
                fill={chartColors.docked}
                name="Docked"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

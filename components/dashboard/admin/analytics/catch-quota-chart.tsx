import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface CatchData {
  species: string;
  catch: number;
  quota: number;
  utilization: number;
}

interface CatchQuotaChartProps {
  data: CatchData[];
}

export function CatchQuotaChart({ data }: CatchQuotaChartProps) {
  const { theme } = useTheme();

  const chartColors = {
    catch: theme === "dark" ? "#60a5fa" : "#2563eb",
    quota: theme === "dark" ? "#6b7280" : "#9ca3af",
    grid: theme === "dark" ? "#374151" : "#e5e7eb",
    text: theme === "dark" ? "#9ca3af" : "#6b7280",
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Catch vs Quota Utilization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis
                dataKey="species"
                stroke={chartColors.text}
                tick={{ fill: chartColors.text }}
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis
                stroke={chartColors.text}
                tick={{ fill: chartColors.text }}
                label={{
                  value: "Volume (tons)",
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
              />
              <Legend />
              <Bar dataKey="catch" fill={chartColors.catch} name="Current Catch" />
              <Bar dataKey="quota" fill={chartColors.quota} name="Total Quota" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// components/ShipmentStatistics.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";

const ShipmentStatistics = () => {
  const data = [
    { date: "1 Jan", shipment: 35, delivery: 20 },
    { date: "2 Jan", shipment: 45, delivery: 25 },
    { date: "3 Jan", shipment: 30, delivery: 22 },
    { date: "4 Jan", shipment: 35, delivery: 30 },
    { date: "5 Jan", shipment: 30, delivery: 25 },
    { date: "6 Jan", shipment: 45, delivery: 40 },
    { date: "7 Jan", shipment: 35, delivery: 30 },
    { date: "8 Jan", shipment: 40, delivery: 30 },
    { date: "9 Jan", shipment: 35, delivery: 25 },
    { date: "10 Jan", shipment: 30, delivery: 22 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="text-sm font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span
                className={cn(
                  "w-3 h-3 rounded-full",
                  entry.name === "Shipment" && "bg-[#FFB547]",
                  entry.name === "Delivery" && "bg-[#0EA5E9]",
                )}
              />
              <span className="capitalize">{entry.name}:</span>
              <span className="font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-medium">
            Shipment Statistics
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Total number of deliveries 23.8k
          </p>
        </div>
        <Select defaultValue="january">
          <SelectTrigger className="w-[120px] h-8">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="january">January</SelectItem>
            <SelectItem value="february">February</SelectItem>
            <SelectItem value="march">March</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-gray-100"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                className="text-xs"
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                className="text-xs"
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="shipment"
                name="Shipment"
                stroke="#FFB547"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 6,
                  strokeWidth: 2,
                  stroke: "#FFFFFF",
                }}
              />
              <Line
                type="monotone"
                dataKey="delivery"
                name="Delivery"
                stroke="#0EA5E9"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 6,
                  strokeWidth: 2,
                  stroke: "#FFFFFF",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FFB547]" />
            <span className="text-sm text-muted-foreground">Shipment</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#0EA5E9]" />
            <span className="text-sm text-muted-foreground">Delivery</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShipmentStatistics;

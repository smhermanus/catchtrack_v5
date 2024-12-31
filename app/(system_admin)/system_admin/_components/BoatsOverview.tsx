// components/BoatsOverview.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Ship, Download, Upload, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusItem {
  label: string;
  time: string;
  percentage: number;
  icon: React.ElementType;
  colorClass: string;
}

const statuses: StatusItem[] = [
  {
    label: "On the way",
    time: "2hr 10min",
    percentage: 39.7,
    icon: Ship,
    colorClass: "bg-[hsl(var(--chart-1))]",
  },
  {
    label: "Unloading",
    time: "3hr 15min",
    percentage: 28.3,
    icon: Download,
    colorClass: "bg-[hsl(var(--chart-2))]",
  },
  {
    label: "Loading",
    time: "1hr 24min",
    percentage: 17.4,
    icon: Upload,
    colorClass: "bg-[hsl(var(--chart-3))]",
  },
  {
    label: "Waiting",
    time: "5hr 19min",
    percentage: 14.6,
    icon: Clock,
    colorClass: "bg-[hsl(var(--chart-4))]",
  },
];

const ProgressSegment = ({
  percentage,
  className,
}: {
  percentage: number;
  className: string;
}) => {
  const widthClass = {
    "39.7": "w-[39.7%]",
    "28.3": "w-[28.3%]",
    "17.4": "w-[17.4%]",
    "14.6": "w-[14.6%]",
  }[percentage.toString()];

  return <div className={cn(widthClass, className)} />;
};

const BoatsOverview = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Boats Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex h-4 rounded-full overflow-hidden">
            {statuses.map((status, index) => (
              <ProgressSegment
                key={index}
                percentage={status.percentage}
                className={status.colorClass}
              />
            ))}
          </div>
        </div>

        {/* Status List */}
        <div className="space-y-4">
          {statuses.map((status, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <status.icon size={16} className="text-muted-foreground" />
                <span>{status.label}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">{status.time}</span>
                <span className="w-16 text-right">{status.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BoatsOverview;

// components/StatCards.tsx
import { Ship, AlertTriangle, Route, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

const StatCards = () => {
  const stats = [
    {
      title: "Boats currently at sea",
      value: "18",
      change: "+18.2%",
      icon: Ship,
      color: "bg-blue-50 text-blue-500",
    },
    {
      title: "Weekly Catch Completed",
      value: "55",
      change: "-8.7%",
      icon: AlertTriangle,
      color: "bg-yellow-50 text-yellow-500",
    },
    {
      title: "Shippers Deviated from route",
      value: "27",
      change: "+4.3%",
      icon: Route,
      color: "bg-pink-50 text-pink-500",
    },
    {
      title: "Late Truck Drivers",
      value: "13",
      change: "+2.5%",
      icon: Clock,
      color: "bg-cyan-50 text-cyan-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-500">
                {stat.title}
              </h3>
              <div className="flex items-baseline">
                <span className="text-2xl font-semibold">{stat.value}</span>
                <span
                  className={`ml-2 text-sm ${stat.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}
                >
                  {stat.change}
                </span>
                <span className="ml-1 text-xs text-gray-400">
                  than last week
                </span>
              </div>
            </div>
            <div className={`p-2 rounded-lg ${stat.color}`}>
              <stat.icon size={20} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatCards;

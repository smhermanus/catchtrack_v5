// components/DeliveryPerformance.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

const DeliveryPerformance = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Delivery Performance
        </CardTitle>
        <p className="text-sm text-gray-500">12% increase in this month</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
              <Package size={20} />
            </div>
            <div>
              <p className="font-medium">Packages in transit</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold">10k</span>
                <span className="text-sm text-green-500">↑ 25.8%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryPerformance;

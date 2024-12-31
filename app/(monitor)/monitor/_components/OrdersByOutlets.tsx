// components/OrdersByOutlets.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const OrdersByOutlets = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Orders by Outlets / Retailers
        </CardTitle>
        <p className="text-sm text-gray-500">62 deliveries in progress</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="new">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="preparing">Preparing</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
          </TabsList>
          <TabsContent value="new">
            {/* Add content for new orders */}
          </TabsContent>
          <TabsContent value="preparing">
            {/* Add content for preparing orders */}
          </TabsContent>
          <TabsContent value="shipping">
            {/* Add content for shipping orders */}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OrdersByOutlets;

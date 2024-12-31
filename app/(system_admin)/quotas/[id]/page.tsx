import { Metadata } from "next";
import { QuotaDetails } from "./_components/quota-details";
import { ComplianceTab } from "./_components/compliance-tab";
import { TransfersTab } from "./_components/transfers-tab";
import { CatchRecordsTab } from "./_components/catch-records-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Quota Details",
  description: "View and manage quota details",
};

export default function QuotaPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="catch-records">Catch Records</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <QuotaDetails id={params.id} />
        </TabsContent>
        <TabsContent value="compliance">
          <ComplianceTab id={params.id} />
        </TabsContent>
        <TabsContent value="transfers">
          <TransfersTab id={params.id} />
        </TabsContent>
        <TabsContent value="catch-records">
          <CatchRecordsTab id={params.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

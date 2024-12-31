import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DataTable } from "@/components/shared/data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getQuotas } from "./actions";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QuotaAnalytics } from "@/components/dashboard/quotas/quota-analytics";
import { QuotaAlerts } from "@/components/dashboard/quotas/quota-alerts";
import { getQuotaAnalytics, getQuotaAlerts } from "./actions";
import { QuotaDetailedAnalytics } from "@/components/dashboard/quotas/quota-detailed-analytics";
import { getQuotaTrends, exportQuotaReport } from "./actions";
import { format } from "date-fns";

export const metadata: Metadata = {
  title: "Quota Management | CatchTrack",
  description: "Manage fishing quotas and allocations",
};

function TableSkeleton() {
  return (
    <Card>
      <div className="p-4">
        <div className="space-y-4">
          <Skeleton className="h-8 w-[200px]" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

async function QuotaTable() {
  const quotas = await getQuotas();

  return (
    <DataTable
      columns={columns}
      data={quotas}
      searchKey="vesselId"
    />
  );
}

async function QuotaAnalyticsSection() {
  const analyticsData = await getQuotaAnalytics();
  const alerts = await getQuotaAlerts();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <QuotaAnalytics data={analyticsData} />
      <QuotaAlerts alerts={alerts} />
    </div>
  );
}

async function QuotaDetailedAnalyticsSection() {
  const trends = await getQuotaTrends();

  const handleExport = async () => {
    'use server';
    const csv = await exportQuotaReport();
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="quota-report-${format(new Date(), 'yyyy-MM-dd')}.csv"`,
      },
    });
  };

  return (
    <QuotaDetailedAnalytics
      trends={trends}
      onExport={handleExport}
    />
  );
}

export default async function QuotasPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SYSTEMADMINISTRATOR") {
    redirect("/");
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quotas</h2>
          <p className="text-muted-foreground">
            Manage fishing quotas and allocations
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/quotas/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Quota
          </Link>
        </Button>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <QuotaAnalyticsSection />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <QuotaDetailedAnalyticsSection />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <QuotaTable />
      </Suspense>
    </div>
  );
}

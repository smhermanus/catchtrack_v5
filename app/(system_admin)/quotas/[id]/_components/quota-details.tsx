"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useQuota } from "../../_hooks/use-quotas";
import { QuotaModal } from "../../_components/quota-modal";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  Calendar,
  Edit,
  FileText,
  MapPin,
  Ship,
  Users,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface QuotaDetailsProps {
  id: string;
}

export function QuotaDetails({ id }: QuotaDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { data: quota, isLoading } = useQuota(id);

  if (isLoading) {
    return <QuotaDetailsSkeleton />;
  }

  if (!quota) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load quota details</AlertDescription>
      </Alert>
    );
  }

  const utilizationPercentage = Math.round(
    (Number(quota.quotaUsed) / Number(quota.finalQuotaAllocation)) * 100
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Quota {quota.quotaCode}
          </h2>
          <p className="text-muted-foreground">
            {quota.marineResources.join(", ")}
          </p>
        </div>
        <Button onClick={() => setIsEditing(true)}>
          <Edit className="mr-2 h-4 w-4" /> Edit Quota
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allocation</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quota.quotaAllocation.toLocaleString()} kg
            </div>
            <div className="mt-4 space-y-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Utilization</p>
                <Progress value={utilizationPercentage} />
                <p className="text-xs text-muted-foreground">
                  {quota.quotaUsed.toLocaleString()} kg ({utilizationPercentage}%)
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="text-sm font-medium">
                  {quota.quotaBalance?.toLocaleString()} kg
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Season</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quota.season}</div>
            <div className="mt-4 space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Start Date</p>
                <p className="text-sm font-medium">
                  {format(new Date(quota.startDate), "PPP")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">End Date</p>
                <p className="text-sm font-medium">
                  {format(new Date(quota.endDate), "PPP")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rightsholders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quota.rightsholders.length}
            </div>
            <div className="mt-4 space-y-1">
              {quota.rightsholders.map((rh) => (
                <div key={rh.rightsholder.id} className="text-sm">
                  {rh.rightsholder.companyName}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Landing Sites</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quota.landingSites.length}
            </div>
            <div className="mt-4 space-y-1">
              {quota.landingSites.map((site) => (
                <div key={site.landingSite.id} className="text-sm">
                  {site.landingSite.siteName}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Species Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quota.species.map((sp) => (
              <div key={sp.species.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{sp.species.commonName}</h4>
                  <Badge variant="outline">{sp.species.scientificName}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {sp.catchLimit && (
                    <div>
                      <p className="text-muted-foreground">Catch Limit</p>
                      <p>{sp.catchLimit.toLocaleString()} kg</p>
                    </div>
                  )}
                  {sp.minimumSize && (
                    <div>
                      <p className="text-muted-foreground">Minimum Size</p>
                      <p>{sp.minimumSize} mm</p>
                    </div>
                  )}
                  {sp.maximumSize && (
                    <div>
                      <p className="text-muted-foreground">Maximum Size</p>
                      <p>{sp.maximumSize} mm</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quota.alerts.map((alert) => (
              <Alert
                key={alert.id}
                variant={
                  alert.alertType.includes("WARNING") ? "warning" : "default"
                }
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  {alert.alertType.replace(/_/g, " ")}
                </AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      </div>

      <QuotaModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        initialData={quota}
      />
    </div>
  );
}

function QuotaDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px] mt-2" />
        </div>
        <Skeleton className="h-10 w-[120px]" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[150px]" />
              <div className="space-y-2 mt-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[80%]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MoreHorizontal, Plus, Loader2 } from "lucide-react";
import { useQuotas, useDeleteQuota } from "../_hooks/use-quotas";
import { QuotaWithRelations } from "../_types";
import { format } from "date-fns";
import { toast } from "sonner";

export function QuotaList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useQuotas({ search, page });
  const deleteQuota = useDeleteQuota();

  const handleDelete = async (id: number) => {
    try {
      await deleteQuota.mutateAsync(id.toString());
      toast.success("Quota deleted successfully");
    } catch (error) {
      toast.error("Failed to delete quota");
    }
  };

  const calculateUsagePercentage = (used: any, total: any) => {
    const usedNum = Number(used);
    const totalNum = Number(total);
    return totalNum > 0 ? Math.round((usedNum / totalNum) * 100) : 0;
  };

  if (error) {
    return <div>Error loading quotas</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search quotas..."
          className="max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add New Quota
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quota Code</TableHead>
              <TableHead>Marine Resources</TableHead>
              <TableHead>Allocation</TableHead>
              <TableHead>Used</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Season</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : (
              data?.quotas.map((quota) => (
                <TableRow key={quota.id}>
                  <TableCell>{quota.quotaCode}</TableCell>
                  <TableCell>
                    {quota.marineResources.map((resource) => (
                      <Badge key={resource} variant="outline" className="mr-1">
                        {resource}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell>{quota.quotaAllocation.toLocaleString()} kg</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Progress 
                        value={calculateUsagePercentage(quota.quotaUsed, quota.finalQuotaAllocation)} 
                      />
                      <p className="text-xs text-muted-foreground">
                        {quota.quotaUsed.toLocaleString()} kg (
                        {calculateUsagePercentage(quota.quotaUsed, quota.finalQuotaAllocation)}
                        %)
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{quota.quotaBalance?.toLocaleString()} kg</TableCell>
                  <TableCell>
                    <Badge variant={quota.status === 'VALID' ? 'default' : 'secondary'}>
                      {quota.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{quota.season}</TableCell>
                  <TableCell>{format(new Date(quota.endDate), 'yyyy-MM-dd')}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Quota</DropdownMenuItem>
                        <DropdownMenuItem>View Catch Records</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Transfer Quota</DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDelete(quota.id)}
                        >
                          Delete Quota
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

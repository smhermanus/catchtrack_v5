"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function RecentSales() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Quota Transfer</p>
          <p className="text-sm text-muted-foreground">
            Transfer of 500kg from Quota A to Quota B
          </p>
        </div>
        <div className="ml-auto font-medium">2h ago</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>SD</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Compliance Report</p>
          <p className="text-sm text-muted-foreground">
            New compliance report submitted
          </p>
        </div>
        <div className="ml-auto font-medium">5h ago</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>RH</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Catch Record</p>
          <p className="text-sm text-muted-foreground">
            New catch record added: 200kg
          </p>
        </div>
        <div className="ml-auto font-medium">1d ago</div>
      </div>
    </div>
  );
}

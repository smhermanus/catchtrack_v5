"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FileText } from "lucide-react";

export type Transfer = {
  id: string;
  date: string;
  type: string;
  status: string;
  amount: number;
  fromRightsholder: string;
  toRightsholder: string;
  approvedBy?: string;
  notes?: string;
  documents: { id: string; name: string; url: string }[];
};

export const columns: ColumnDef<Transfer>[] = [
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <Badge variant="outline">
          {type.replace(/_/g, " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "APPROVED"
              ? "success"
              : status === "REJECTED"
              ? "destructive"
              : "default"
          }
        >
          {status.replace(/_/g, " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount (kg)",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      return amount.toLocaleString();
    },
  },
  {
    accessorKey: "fromRightsholder",
    header: "From",
  },
  {
    accessorKey: "toRightsholder",
    header: "To",
  },
  {
    accessorKey: "approvedBy",
    header: "Approved By",
  },
  {
    accessorKey: "notes",
    header: "Notes",
  },
  {
    accessorKey: "documents",
    header: "Documents",
    cell: ({ row }) => {
      const documents = row.getValue("documents") as { id: string; name: string; url: string }[];
      if (!documents?.length) return null;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <FileText className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Documents</DropdownMenuLabel>
            {documents.map((doc) => (
              <DropdownMenuItem key={doc.id}>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {doc.name}
                </a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View details</DropdownMenuItem>
            {status === "PENDING" && (
              <>
                <DropdownMenuItem>Approve</DropdownMenuItem>
                <DropdownMenuItem>Reject</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

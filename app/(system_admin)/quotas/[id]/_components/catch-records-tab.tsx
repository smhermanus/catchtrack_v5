"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useCatchRecords } from "../../_hooks/use-catch-records";
import { DataTable } from "@/components/ui/data-table";
import { columns, FormattedCatchRecord } from "./catch-record-columns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Decimal } from "@prisma/client/runtime/library";

interface CatchRecordsTabProps {
  id: string;
}

export function CatchRecordsTab({ id }: CatchRecordsTabProps) {
  const { data: catchRecords = [], isLoading } = useCatchRecords(id);

  const formattedRecords: FormattedCatchRecord[] = catchRecords.map((record) => ({
    id: record.id.toString(),
    date: format(new Date(record.date), "PPP"),
    landingSite: record.landingSite.siteName,
    rightsholder: record.rightsholder.companyName,
    species: record.species.commonName,
    weight: Number(record.weight),
    grade: record.grade,
    temperature: record.temperature,
    inspector: record.inspector.name,
    notes: record.notes,
  }));

  // Calculate summary statistics
  const totalWeight = formattedRecords.reduce((sum, record) => sum + record.weight, 0);
  const speciesSummary = formattedRecords.reduce((acc, record) => {
    acc[record.species] = (acc[record.species] || 0) + record.weight;
    return acc;
  }, {} as Record<string, number>);

  const landingSiteSummary = formattedRecords.reduce((acc, record) => {
    acc[record.landingSite] = (acc[record.landingSite] || 0) + record.weight;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Catch</CardTitle>
            <CardDescription>Total weight of all catches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalWeight.toLocaleString()} kg
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Species Breakdown</CardTitle>
            <CardDescription>Catch weight by species</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(speciesSummary).map(([species, weight]) => (
                <div key={species} className="flex justify-between">
                  <span>{species}</span>
                  <span className="font-medium">{weight.toLocaleString()} kg</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Landing Sites</CardTitle>
            <CardDescription>Catch weight by landing site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(landingSiteSummary).map(([site, weight]) => (
                <div key={site} className="flex justify-between">
                  <span>{site}</span>
                  <span className="font-medium">{weight.toLocaleString()} kg</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catch Records</CardTitle>
          <CardDescription>
            Detailed list of all catch records for this quota
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={formattedRecords}
            loading={isLoading}
            searchKey="rightsholder"
          />
        </CardContent>
      </Card>
    </div>
  );
}

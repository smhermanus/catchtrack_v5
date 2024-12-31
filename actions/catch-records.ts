'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getCatchRecords() {
  try {
    const records = await db.catchRecord.findMany({
      include: {
        vessel: true,
        monitor: true,
        rightsholder: true,
        quota: true,
        landingSite: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { records };
  } catch (error) {
    console.error('Failed to fetch catch records:', error);
    return { error: 'Failed to fetch catch records' };
  }
}

export async function getCatchRecordById(id: string) {
  try {
    const record = await db.catchRecord.findUnique({
      where: { id: parseInt(id) },
      include: {
        vessel: true,
        monitor: true,
        rightsholder: true,
        quota: true,
        landingSite: true,
      },
    });
    return { record };
  } catch (error) {
    console.error('Failed to fetch catch record:', error);
    return { error: 'Failed to fetch catch record' };
  }
}

export async function createCatchRecord({
  quotaId,
  monitorId,
  rightsholderId,
  vesselId,
  siteId,
  grossRegisteredTonnage,
  locationCoordinates,
  trapsSet,
  trapsPulled,
  binsAnimals,
  totalCatchMass,
  numberOfCatches,
  departureDate,
  landingDate,
  notes,
  uploadImageUrl,
}: {
  quotaId: string;
  monitorId: string;
  rightsholderId: string;
  vesselId: string;
  siteId: string;
  grossRegisteredTonnage?: number;
  locationCoordinates?: { lat: number; lng: number };
  trapsSet?: number;
  trapsPulled?: number;
  binsAnimals?: number;
  totalCatchMass: number;
  numberOfCatches: number;
  departureDate: Date;
  landingDate: Date;
  notes?: string;
  uploadImageUrl?: string;
}) {
  try {
    const record = await db.catchRecord.create({
      data: {
        quotaId: parseInt(quotaId),
        monitorId: parseInt(monitorId),
        rightsholderId: parseInt(rightsholderId),
        vesselId: parseInt(vesselId),
        siteId: parseInt(siteId),
        grossRegisteredTonnage,
        locationCoordinates: locationCoordinates ? { type: 'Point', coordinates: [locationCoordinates.lng, locationCoordinates.lat] } : undefined,
        trapsSet,
        trapsPulled,
        binsAnimals,
        totalCatchMass,
        numberOfCatches,
        departureDate,
        landingDate,
        notes,
        uploadImageUrl,
      },
      include: {
        vessel: true,
        monitor: true,
        rightsholder: true,
        quota: true,
        landingSite: true,
      },
    });

    revalidatePath('/monitor/catch-records');
    return { record };
  } catch (error) {
    console.error('Failed to create catch record:', error);
    return { error: 'Failed to create catch record' };
  }
}
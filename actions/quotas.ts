'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auditLogger } from '@/lib/audit-logger';
import { getCurrentUser } from '@/lib/auth';
import { AuditAction } from '@prisma/client';

export async function getQuotas() {
  try {
    const quotas = await db.quota.findMany({
      include: {
        quotaAllocations: true,
        species: true,
        landingSites: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { quotas };
  } catch {
    return { error: 'Failed to fetch quotas' };
  }
}

export async function getQuotaById(id: string) {
  try {
    const quota = await db.quota.findUnique({
      where: { id: parseInt(id) },
      include: {
        quotaAllocations: true,
        species: true,
        landingSites: true,
      },
    });
    return { quota };
  } catch {
    return { error: 'Failed to fetch quota' };
  }
}

export async function createQuota({
  quotaCode,
  quotaAllocation,
  startDate,
  endDate,
  status,
  season,
  marineResources,
  productType,
  sectorName,
  catchArea3_4,
  catchArea7,
  catchArea8,
  catchArea11,
  zone,
  createdByUser,
}: {
  quotaCode: string;
  quotaAllocation: number;
  startDate: Date;
  endDate: Date;
  status: 'VALID' | 'INVALID' | 'EXPIRED';
  season: string;
  marineResources: string[];
  productType: string;
  sectorName: string;
  catchArea3_4?: boolean;
  catchArea7?: boolean;
  catchArea8?: boolean;
  catchArea11?: boolean;
  zone?: string;
  createdByUser: string;
}) {
  try {
    const exists = await db.quota.findUnique({
      where: { quotaCode },
    });

    if (exists) {
      return { error: 'Quota with this code already exists' };
    }

    const currentUser = await getCurrentUser();

    const quota = await db.quota.create({
      data: {
        quotaCode,
        quotaAllocation,
        overcatch20232024: 0,
        finalQuotaAllocation: quotaAllocation,
        quotaUsed: 0,
        startDate,
        endDate,
        status,
        season,
        marineResources,
        productType,
        sectorName,
        catchArea3_4: catchArea3_4 ?? false,
        catchArea7: catchArea7 ?? false,
        catchArea8: catchArea8 ?? false,
        catchArea11: catchArea11 ?? false,
        zone,
        createdByUser: {
          connect: { id: parseInt(createdByUser) },
        },
      },
    });

    // Log the audit event
    await auditLogger.logCollaborationEvent(
      AuditAction.USER_CREATED,
      'Create Quota',
      currentUser.id.toString(),
      { quotaId: quota.id.toString() },
      {
        resourceType: 'Quota',
        resourceId: quota.id.toString(),
        changes: {
          quotaCode,
          quotaAllocation,
          startDate,
          endDate,
          status,
          season,
          marineResources,
          productType,
          sectorName,
        },
      }
    );

    return { quota };
  } catch (error) {
    console.error('Error creating quota:', error);
    return { error: 'Failed to create quota' };
  }
}

export async function updateQuota(
  id: string,
  data: Partial<{
    quotaAllocation: number;
    status: 'VALID' | 'INVALID' | 'EXPIRED';
    endDate: Date;
  }>
) {
  try {
    // First, get the existing quota to compare changes
    const existingQuota = await db.quota.findUnique({
      where: { id: parseInt(id) },
    });

    const currentUser = await getCurrentUser();

    const quota = await db.quota.update({
      where: { id: parseInt(id) },
      data,
    });

    // Log the audit event with changes
    await auditLogger.logCollaborationEvent(
      AuditAction.USER_UPDATED,
      'Update Quota',
      currentUser.id.toString(),
      { quotaId: id },
      {
        resourceType: 'Quota',
        resourceId: id,
        changes: {
          ...(data.quotaAllocation !== undefined && {
            quotaAllocation: {
              from: existingQuota?.quotaAllocation,
              to: data.quotaAllocation,
            },
          }),
          ...(data.status !== undefined && {
            status: {
              from: existingQuota?.status,
              to: data.status,
            },
          }),
          ...(data.endDate !== undefined && {
            endDate: {
              from: existingQuota?.endDate,
              to: data.endDate,
            },
          }),
        },
      }
    );

    revalidatePath('/admin/quotas');
    return { quota };
  } catch {
    return { error: 'Failed to update quota' };
  }
}

export async function allocateQuota({
  quotaId,
  vesselId,
  amount,
}: {
  quotaId: string;
  vesselId: string;
  amount: number;
}) {
  try {
    const currentUser = await getCurrentUser();

    const quota = await db.quota.findUnique({
      where: { id: parseInt(quotaId) },
      include: {
        quotaAllocations: true,
      },
    });

    if (!quota) {
      return { error: 'Quota not found' };
    }

    const totalAllocated = quota.quotaAllocations.reduce(
      (sum, allocation) => sum + Number(allocation.amount),
      0
    );

    if (totalAllocated + amount > Number(quota.quotaAllocation)) {
      return { error: 'Insufficient quota available' };
    }

    const allocation = await db.quotaAllocation.create({
      data: {
        vesselId: parseInt(vesselId),
        quotaId: parseInt(quotaId),
        amount,
      },
    });

    // Log the audit event
    await auditLogger.logCollaborationEvent(
      AuditAction.USER_CREATED,
      'Allocate Quota',
      currentUser.id.toString(),
      {
        quotaId,
        allocationId: allocation.id.toString(),
      },
      {
        resourceType: 'QuotaAllocation',
        resourceId: allocation.id.toString(),
        changes: {
          vesselId,
          amount,
          totalQuotaAllocation: quota.quotaAllocation,
          previouslyAllocated: totalAllocated,
          newTotalAllocated: totalAllocated + amount,
        },
      }
    );

    revalidatePath('/admin/quotas');
    return { allocation };
  } catch (error) {
    console.error('Error allocating quota:', error);
    return { error: 'Failed to allocate quota' };
  }
}

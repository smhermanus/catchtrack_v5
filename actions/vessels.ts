'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getVessels() {
  try {
    const vessels = await db.vessel.findMany({
      include: {
        rightsholder: true,
        quotaAllocations: {
          include: {
            quota: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return { vessels };
  } catch {
    return { error: 'Failed to fetch vessels' };
  }
}

export async function getVesselById(id: string) {
  try {
    const vessel = await db.vessel.findUnique({
      where: { id: parseInt(id) },
      include: {
        rightsholder: true,
        quotaAllocations: {
          include: {
            quota: true,
          },
        },
        catchRecords: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });
    return { vessel };
  } catch {
    return { error: 'Failed to fetch vessel' };
  }
}

export async function createVessel({
  name,
  registrationNumber,
  rightsholderId,
  type,
}: {
  name: string;
  registrationNumber: string;
  rightsholderId: string;
  type: string;
}) {
  try {
    const exists = await db.vessel.findFirst({
      where: {
        OR: [{ name }, { registrationNumber }],
      },
    });

    if (exists) {
      return { error: 'Vessel with this name or registration number already exists' };
    }

    const vessel = await db.vessel.create({
      data: {
        name,
        registrationNumber,
        rightsholderId: parseInt(rightsholderId),
        type,
        status: 'ACTIVE',
      },
    });

    revalidatePath('/rightsholder/vessels');
    return { vessel };
  } catch {
    return { error: 'Failed to create vessel' };
  }
}

export async function updateVesselStatus(
  id: string,
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'
) {
  try {
    const vessel = await db.vessel.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    revalidatePath('/rightsholder/vessels');
    return { vessel };
  } catch {
    return { error: 'Failed to update vessel status' };
  }
}

export async function assignVesselQuota({
  vesselId,
  quotaId,
  amount,
}: {
  vesselId: string;
  quotaId: string;
  amount: number;
}) {
  try {
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

    revalidatePath('/rightsholder/vessels');
    return { allocation };
  } catch {
    return { error: 'Failed to assign quota to vessel' };
  }
}

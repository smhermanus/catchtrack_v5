'use server';

import { db } from '@/lib/db';
import { validateRequest } from '../../../../auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const vesselSchema = z.object({
  name: z.string().min(2).max(100),
  registrationNumber: z.string().min(2).max(50),
  vesselType: z.string().min(2).max(50),
  rightsholderId: z.number().int().positive(),
});

export type VesselFormData = z.infer<typeof vesselSchema>;

export async function getVessels() {
  try {
    const { user } = await validateRequest();

    if (!user || user.role !== 'SYSTEMADMINISTRATOR') {
      throw new Error('Unauthorized');
    }

    const vessels = await db.vessel.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return vessels;
  } catch (error) {
    console.error('Failed to fetch vessels:', error);
    throw error;
  }
}

export async function createVessel(data: VesselFormData) {
  try {
    const { user } = await validateRequest();

    if (!user || user.role !== 'SYSTEMADMINISTRATOR') {
      throw new Error('Unauthorized');
    }

    const validatedData = vesselSchema.parse(data);
    const userId = parseInt(user.id);

    if (isNaN(userId)) {
      throw new Error('Invalid user ID');
    }

    const vessel = await db.vessel.create({
      data: {
        name: validatedData.name,
        registrationNumber: validatedData.registrationNumber,
        type: validatedData.vesselType,
        rightsholderId: validatedData.rightsholderId,
        status: 'INACTIVE',
        createdBy: userId,
        lastStatusUpdate: new Date(),
      },
    });

    revalidatePath('/admin/vessels');
    return { success: true, vessel };
  } catch (error) {
    console.error('Failed to create vessel:', error);
    throw error;
  }
}

export async function updateVesselStatus(
  vesselId: string,
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'DOCKED'
) {
  try {
    const { user } = await validateRequest();

    if (!user || user.role !== 'SYSTEMADMINISTRATOR') {
      throw new Error('Unauthorized');
    }

    const vessel = await db.vessel.update({
      where: { id: parseInt(vesselId, 10) },
      data: {
        status,
        lastStatusUpdate: new Date(),
      },
    });

    revalidatePath('/admin/vessels');
    return { success: true, vessel };
  } catch (error) {
    console.error('Failed to update vessel status:', error);
    throw error;
  }
}

export async function updateVessel(vesselId: string, data: Partial<VesselFormData>) {
  try {
    const { user } = await validateRequest();

    if (!user || user.role !== 'SYSTEMADMINISTRATOR') {
      throw new Error('Unauthorized');
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.registrationNumber) updateData.registrationNumber = data.registrationNumber;
    if (data.vesselType) updateData.type = data.vesselType;
    if (data.rightsholderId) updateData.rightsholderId = data.rightsholderId;

    const vessel = await db.vessel.update({
      where: { id: parseInt(vesselId, 10) },
      data: updateData,
    });

    revalidatePath('/admin/vessels');
    return { success: true, vessel };
  } catch (error) {
    console.error('Failed to update vessel:', error);
    throw error;
  }
}

export async function deleteVessel(vesselId: string) {
  try {
    const { user } = await validateRequest();

    if (!user || user.role !== 'SYSTEMADMINISTRATOR') {
      throw new Error('Unauthorized');
    }

    await db.vessel.delete({
      where: { id: parseInt(vesselId, 10) },
    });

    revalidatePath('/admin/vessels');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete vessel:', error);
    throw error;
  }
}

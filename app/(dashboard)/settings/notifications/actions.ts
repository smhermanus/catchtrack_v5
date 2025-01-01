'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const preferencesSchema = z.object({
  quotaWarningThreshold: z.number().min(1).max(100),
  quotaCriticalThreshold: z.number().min(1).max(100),
  daysBeforeExpiryWarning: z.number().min(1).max(365),
  emailNotifications: z.boolean(),
  dailyDigest: z.boolean(),
  weeklyReport: z.boolean(),
});

export async function updateNotificationPreferences(
  userId: string,
  preferences: z.infer<typeof preferencesSchema>
) {
  try {
    const validatedData = preferencesSchema.parse(preferences);
    const userIdNumber = parseInt(userId, 10);

    await db.userPreferences.upsert({
      where: { userId: userIdNumber },
      create: {
        userId: userIdNumber,
        ...validatedData,
      },
      update: validatedData,
    });

    revalidatePath('/settings/notifications');
    return { success: true };
  } catch (error) {
    console.error('Failed to update notification preferences:', error);
    throw new Error('Failed to update notification preferences');
  }
}

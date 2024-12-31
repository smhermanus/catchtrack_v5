import { NextResponse } from 'next/server';
import { validateRequest } from '@/auth';
import { db } from '@/lib/db';
import { UserStatus, AuditAction } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await validateRequest();

    if (!user || user.role !== 'SYSTEMADMINISTRATOR') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return new NextResponse('Invalid user ID', { status: 400 });
    }

    const { reason } = await request.json();

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.REJECTED,
        rejectedBy: parseInt(user.id),
        rejectedAt: new Date(),
        rejectionReason: reason,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: parseInt(user.id),
        action: AuditAction.USER_REJECTED,
        actionType: 'UPDATE',
        tableName: 'users',
        recordId: userId,
        changes: {
          status: UserStatus.REJECTED,
          rejectedBy: user.id,
          rejectedAt: new Date(),
          rejectionReason: reason,
        },
      },
    });

    revalidatePath('/system_admin/users');
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error rejecting user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { lucia, validateRequest, hasRole } from '../../../../../auth';
import { db } from '@/lib/db';
import type { DatabaseUserAttributes } from 'lucia';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user, session } = await validateRequest();

    if (!user || !session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!hasRole(user, 'INSPECTOR')) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = await request.json();
    const { violationType, description } = body;

    const record = await db.complianceRecord.create({
      data: {
        quotaId: parseInt(params.id),
        violationType,
        description,
        reportedBy: parseInt(user.id),
      },
    });

    await db.quotaAlert.create({
      data: {
        quotaId: parseInt(params.id),
        alertType: 'COMPLIANCE_VIOLATION',
        message: `New compliance violation reported: ${violationType}`,
      },
    });

    await db.auditLog.create({
      data: {
        userId: parseInt(user.id),
        action: 'COMPLIANCE_REPORTED',
        actionType: 'CREATE',
        tableName: 'compliance_records',
        recordId: record.id,
        changes: {
          violationType,
          description,
        },
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error('[QUOTA_COMPLIANCE_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user, session } = await validateRequest();

    if (!user || !session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!hasRole(user, 'INSPECTOR')) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = await request.json();
    const { recordId, status, resolution } = body;

    const resolvedByValue = ['RESOLVED', 'DISMISSED'].includes(status) ? parseInt(user.id) : null;

    const record = await db.complianceRecord.update({
      where: { id: parseInt(recordId) },
      data: {
        status,
        resolution,
        resolvedAt: ['RESOLVED', 'DISMISSED'].includes(status) ? new Date() : null,
        resolvedBy: resolvedByValue,
      },
    });

    if (['RESOLVED', 'DISMISSED'].includes(status)) {
      await db.quotaAlert.create({
        data: {
          quotaId: parseInt(params.id),
          alertType: 'COMPLIANCE_VIOLATION',
          message: `Compliance violation ${status.toLowerCase()}: ${resolution}`,
        },
      });
    }

    const auditActionMap = {
      RESOLVED: 'COMPLIANCE_RESOLVED',
      DISMISSED: 'COMPLIANCE_DISMISSED',
      PENDING: 'COMPLIANCE_UPDATED',
    } as const;

    await db.auditLog.create({
      data: {
        userId: parseInt(user.id),
        action: auditActionMap[status as keyof typeof auditActionMap],
        actionType: 'UPDATE',
        tableName: 'compliance_records',
        recordId: record.id,
        changes: {
          status,
          resolution,
        },
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error('[QUOTA_COMPLIANCE_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { validateRequest } from '@/auth';
import { db } from '@/lib/db';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { destinationQuotaId, amount, reason } = body;

    const sourceQuota = await db.quota.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!sourceQuota) {
      return new NextResponse('Source quota not found', { status: 404 });
    }

    if (sourceQuota.quotaBalance && sourceQuota.quotaBalance < amount) {
      return new NextResponse('Insufficient quota balance', { status: 400 });
    }

    const transfer = await db.quotaTransfer.create({
      data: {
        sourceQuotaId: parseInt(params.id),
        destinationQuotaId: parseInt(destinationQuotaId),
        amount,
        reason,
      },
    });

    // Create alert for the transfer request
    await db.quotaAlert.create({
      data: {
        quotaId: parseInt(params.id),
        alertType: 'TRANSFER_REQUEST',
        message: `Transfer request of ${amount} to Quota #${destinationQuotaId}`,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: parseInt(user.id),
        action: 'TRANSFER_REQUESTED',
        actionType: 'CREATE',
        tableName: 'quota_transfers',
        recordId: transfer.id,
        changes: {
          sourceQuotaId: params.id,
          destinationQuotaId,
          amount,
          reason,
        },
      },
    });

    return NextResponse.json(transfer);
  } catch (error) {
    console.error('[QUOTA_TRANSFER_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { transferId, status, rejectionReason } = body;

    const transfer = await db.quotaTransfer.update({
      where: { id: parseInt(transferId) },
      data: {
        status,
        approvedAt: status === 'APPROVED' ? new Date() : null,
        approvedBy: status === 'APPROVED' ? parseInt(user.id) : null,
      },
    });

    if (status === 'APPROVED') {
      // Update source quota balance
      await db.quota.update({
        where: { id: transfer.sourceQuotaId },
        data: {
          quotaBalance: {
            decrement: transfer.amount,
          },
        },
      });

      // Update destination quota balance
      await db.quota.update({
        where: { id: transfer.destinationQuotaId },
        data: {
          quotaBalance: {
            increment: transfer.amount,
          },
        },
      });

      // Create alerts for both quotas
      await Promise.all([
        db.quotaAlert.create({
          data: {
            quotaId: transfer.sourceQuotaId,
            alertType: 'TRANSFER_APPROVED',
            message: `Transfer of ${transfer.amount} to Quota #${transfer.destinationQuotaId} approved`,
          },
        }),
        db.quotaAlert.create({
          data: {
            quotaId: transfer.destinationQuotaId,
            alertType: 'TRANSFER_APPROVED',
            message: `Transfer of ${transfer.amount} from Quota #${transfer.sourceQuotaId} approved`,
          },
        }),
      ]);
    } else if (status === 'REJECTED') {
      // Create alert for rejection
      await db.quotaAlert.create({
        data: {
          quotaId: transfer.sourceQuotaId,
          alertType: 'TRANSFER_REJECTED',
          message: `Transfer request rejected: ${rejectionReason}`,
        },
      });
    }

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: parseInt(user.id),
        action: status === 'APPROVED' ? 'TRANSFER_APPROVED' : 'TRANSFER_REJECTED',
        actionType: 'UPDATE',
        tableName: 'quota_transfers',
        recordId: transfer.id,
        changes: {
          status,
          rejectionReason,
        },
      },
    });

    return NextResponse.json(transfer);
  } catch (error) {
    console.error('[QUOTA_TRANSFER_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const quota = await db.quota.findUnique({
      where: {
        id: parseInt(params.id),
      },
      include: {
        species: {
          include: {
            species: true,
          },
        },
        landingSites: {
          include: {
            landingSite: true,
          },
        },
        rightsholders: {
          include: {
            rightsholder: true,
          },
        },
        alerts: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        complianceRecords: {
          orderBy: {
            reportedAt: "desc",
          },
          take: 10,
          include: {
            reporter: true,
            resolver: true,
          },
        },
        transfers: {
          orderBy: {
            requestedAt: "desc",
          },
          take: 10,
          include: {
            destinationQuota: true,
            approver: true,
          },
        },
        transfersReceived: {
          orderBy: {
            requestedAt: "desc",
          },
          take: 10,
          include: {
            sourceQuota: true,
            approver: true,
          },
        },
      },
    });

    if (!quota) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(quota);
  } catch (error) {
    console.error("[QUOTA_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const {
      quotaAllocation,
      startDate,
      endDate,
      status,
      marineResources,
      productType,
      sectorName,
      species,
      landingSites,
      rightsholders,
      seasonalRestrictions,
      warningThreshold,
      criticalThreshold,
    } = body;

    const quota = await db.quota.update({
      where: {
        id: parseInt(params.id),
      },
      data: {
        quotaAllocation,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status,
        marineResources,
        productType,
        sectorName,
        seasonalRestrictions,
        warningThreshold,
        criticalThreshold,
        lastUpdatedBy: parseInt(user.id),
        species: {
          deleteMany: {},
          create: species.map((s: any) => ({
            speciesId: s.id,
            catchLimit: s.catchLimit,
            minimumSize: s.minimumSize,
            maximumSize: s.maximumSize,
            seasonStart: s.seasonStart ? new Date(s.seasonStart) : null,
            seasonEnd: s.seasonEnd ? new Date(s.seasonEnd) : null,
            restrictions: s.restrictions,
          })),
        },
        landingSites: {
          deleteMany: {},
          create: landingSites.map((siteId: number) => ({
            siteId,
          })),
        },
        rightsholders: {
          deleteMany: {},
          create: rightsholders.map((rightsholderId: number) => ({
            rightsholderId,
          })),
        },
      },
    });

    // Create audit log for the update
    await db.auditLog.create({
      data: {
        userId: parseInt(user.id),
        action: "QUOTA_UPDATED",
        actionType: "UPDATE",
        tableName: "quotas",
        recordId: quota.id,
        changes: body,
      },
    });

    return NextResponse.json(quota);
  } catch (error) {
    console.error("[QUOTA_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const quota = await db.quota.delete({
      where: {
        id: parseInt(params.id),
      },
    });

    // Create audit log for the deletion
    await db.auditLog.create({
      data: {
        userId: parseInt(user.id),
        action: "QUOTA_DELETED",
        actionType: "DELETE",
        tableName: "quotas",
        recordId: quota.id,
        changes: quota,
      },
    });

    return NextResponse.json(quota);
  } catch (error) {
    console.error("[QUOTA_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

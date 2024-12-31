import { NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import { db } from "@/lib/db";
import { Prisma, QuotaStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") as QuotaStatus | null;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: Prisma.QuotaWhereInput = {
      OR: [
        { quotaCode: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
        { marineResources: { hasSome: [search] } },
      ],
      ...(status && { status }),
    };

    const [quotas, total] = await Promise.all([
      db.quota.findMany({
        where,
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
            where: {
              isRead: false,
            },
            take: 5,
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      db.quota.count({ where }),
    ]);

    return NextResponse.json({
      quotas,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[QUOTAS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const {
      quotaCode,
      quotaAllocation,
      startDate,
      endDate,
      marineResources,
      productType,
      sectorName,
      species,
      landingSites,
      rightsholders,
      seasonalRestrictions,
    } = body;

    const quota = await db.quota.create({
      data: {
        quotaCode,
        quotaAllocation,
        finalQuotaAllocation: quotaAllocation, // Initial allocation
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: "VALID",
        season: `${new Date(startDate).getFullYear()}/${new Date(endDate).getFullYear()}`,
        marineResources,
        productType,
        sectorName,
        createdBy: parseInt(user.id),
        seasonalRestrictions,
        species: {
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
          create: landingSites.map((siteId: number) => ({
            siteId,
          })),
        },
        rightsholders: {
          create: rightsholders.map((rightsholderId: number) => ({
            rightsholderId,
          })),
        },
      },
    });

    // Create initial audit log
    await db.auditLog.create({
      data: {
        userId: parseInt(user.id),
        action: "QUOTA_CREATED",
        actionType: "CREATE",
        tableName: "quotas",
        recordId: quota.id,
        changes: {
          quotaCode,
          quotaAllocation,
          startDate,
          endDate,
          marineResources,
          productType,
          sectorName,
        },
      },
    });

    return NextResponse.json(quota);
  } catch (error) {
    console.error("[QUOTAS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

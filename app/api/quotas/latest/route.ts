import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const latestQuota = await prisma.quota.findFirst({
      where: { status: "VALID" },
      orderBy: { createdAt: "desc" },
      include: {
        createdByUser: true,
        lastUpdatedByUser: true,
        species: {
          include: {
            species: true,
          }
        },
        landingSites: {
          include: {
            landingSite: true,
          }
        },
        rightsholders: {
          include: {
            rightsholder: true,
          }
        },
        transfers: {
          include: {
            sourceQuota: true,
            destinationQuota: true,
          }
        },
        transfersReceived: {
          include: {
            sourceQuota: true,
            destinationQuota: true,
          }
        }
      },
    });

    if (!latestQuota) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(latestQuota);
  } catch (error) {
    console.error("[LATEST_QUOTA]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

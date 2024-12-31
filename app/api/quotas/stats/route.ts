import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalActiveQuotas,
      totalAllocation,
      totalUsed,
      totalBalance,
    ] = await Promise.all([
      prisma.quota.count({
        where: { status: "VALID" },
      }),
      prisma.quota.aggregate({
        where: { status: "VALID" },
        _sum: { quotaAllocation: true },
      }),
      prisma.quota.aggregate({
        where: { status: "VALID" },
        _sum: { quotaUsed: true },
      }),
      prisma.quota.aggregate({
        where: { status: "VALID" },
        _sum: { quotaBalance: true },
      }),
    ]);

    return NextResponse.json({
      totalActiveQuotas,
      totalAllocation: totalAllocation._sum.quotaAllocation || 0,
      totalUsed: totalUsed._sum.quotaUsed || 0,
      totalBalance: totalBalance._sum.quotaBalance || 0,
    });
  } catch (error) {
    console.error("[QUOTA_STATS]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

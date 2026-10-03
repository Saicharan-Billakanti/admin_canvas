import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.productVariant.findMany({
      orderBy: { createdAt: "desc" },
    });
    const distinctProducts = new Set(rows.map((r) => r.productCode)).size;
    return NextResponse.json({ rows, total: rows.length, distinctProducts });
  } catch (err) {
    console.error("[GET /api/admin/rows]", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

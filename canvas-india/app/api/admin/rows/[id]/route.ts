import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.productVariant.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/rows/[id]]", err);
    return NextResponse.json({ message: "Not found or error" }, { status: 404 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const updated = await prisma.productVariant.update({
      where: { id },
      data: {
        productName: body.productName,
        category: body.category,
        shape: body.shape,
        size: body.size,
        allowCustomSize: body.allowCustomSize,
        customSizeLimit: body.customSizeLimit,
        finish: body.finish,
        price: body.price ? parseFloat(body.price) : 0,
        compareAtPrice: body.compareAtPrice ? parseFloat(body.compareAtPrice) : null,
        startingStock: body.startingStock ? parseInt(body.startingStock, 10) : 0,
        description: body.description,
        mainImageUrl: body.mainImageUrl,
      },
    });
    
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH /api/admin/rows/[id]]", err);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}

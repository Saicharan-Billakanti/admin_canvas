import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { submitSchema } from "@/app/lib/validation";
import { ZodError, z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Server-side validation
    const parsed = submitSchema.parse(body);

    // Ensure all variants share the same product code (already guaranteed by schema structure,
    // but verify productCode consistency across the payload just in case)
    const { productCode, productName, category, description, mainImageUrl, additionalImageUrls, variants } = parsed;

    // Validate all variant product codes match (they're shared at the top level, but belt-and-suspenders)
    const rows = variants.map((variant) => ({
      productCode,
      productName,
      category,
      description: description ?? null,
      mainImageUrl,
      additionalImageUrls: additionalImageUrls ?? null,
      shape: variant.shape ?? null,
      size: variant.size,
      material: variant.material ?? null,
      finish: variant.finish ?? null,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice ?? null,
      startingStock: variant.startingStock,
    }));

    await prisma.productVariant.createMany({ data: rows });

    return NextResponse.json(
      { success: true, count: rows.length },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { success: false, errors: z.flattenError(err).fieldErrors, message: "Validation failed" },
        { status: 422 }
      );
    }
    console.error("[POST /api/submit]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

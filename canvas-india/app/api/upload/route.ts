import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    // Convert file to buffer and then to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "canvas-india-products",
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (err: any) {
    console.error("[POST /api/upload]", err);
    return NextResponse.json(
      { message: "Image upload failed: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}

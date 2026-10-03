import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import ExcelJS from "exceljs";

export async function GET() {
  try {
    const rows = await prisma.productVariant.findMany({
      orderBy: [{ productCode: "asc" }, { createdAt: "asc" }],
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Canvas India";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Product Catalog", {
      views: [{ state: "frozen", ySplit: 1 }],
    });

    // Define columns
    sheet.columns = [
      { header: "Product Code",       key: "productCode",         width: 16 },
      { header: "Product Name",       key: "productName",         width: 28 },
      { header: "Category",           key: "category",            width: 20 },
      { header: "Shape",              key: "shape",               width: 14 },
      { header: "Size",               key: "size",                width: 22 },
      { header: "Allow Custom Size",  key: "allowCustomSize",     width: 20 },
      { header: "Finish / Style",     key: "finish",              width: 24 },
      { header: "Price (INR)",        key: "price",               width: 14 },
      { header: "Compare-at (INR)",   key: "compareAtPrice",      width: 18 },
      { header: "Starting Stock",     key: "startingStock",       width: 14 },
      { header: "Description",        key: "description",         width: 40 },
      { header: "Main Image URL",     key: "mainImageUrl",        width: 50 },
      { header: "Additional Images",  key: "additionalImageUrls", width: 50 },
      { header: "Submitted At",       key: "createdAt",           width: 22 },
    ];

    // Style the header row
    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1A1A2E" }, // dark navy
      };
      cell.font = {
        bold: true,
        color: { argb: "FFFFFFFF" },
        size: 11,
        name: "Calibri",
      };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      cell.border = {
        bottom: { style: "medium", color: { argb: "FF16213E" } },
      };
    });
    headerRow.height = 28;

    // Number formats
    const currencyFmt = '₹#,##0.00';
    const intFmt = '#,##0';

    // Add data rows
    rows.forEach((row, idx) => {
      const dataRow = sheet.addRow({
        productCode: row.productCode,
        productName: row.productName,
        category: row.category,
        shape: row.shape ?? "",
        size: row.size,
        allowCustomSize: row.allowCustomSize ? "Yes" : "No",
        finish: row.finish ?? "",
        price: row.price,
        compareAtPrice: row.compareAtPrice ?? "",
        startingStock: row.startingStock,
        description: row.description ?? "",
        mainImageUrl: row.mainImageUrl,
        additionalImageUrls: row.additionalImageUrls ?? "",
        createdAt: row.createdAt.toISOString().replace("T", " ").substring(0, 19),
      });

      // Alternating row colours
      const bgColor = idx % 2 === 0 ? "FFFAFAFA" : "FFF0F4FF";
      dataRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: bgColor },
        };
        cell.alignment = { vertical: "top", wrapText: false };
        cell.font = { size: 10, name: "Calibri" };
      });

      // Apply number formatting to price/stock cells
      dataRow.getCell("price").numFmt = currencyFmt;
      if (row.compareAtPrice != null) {
        dataRow.getCell("compareAtPrice").numFmt = currencyFmt;
      }
      dataRow.getCell("startingStock").numFmt = intFmt;
      dataRow.height = 18;
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="canvas-india-catalog-${new Date().toISOString().split("T")[0]}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[GET /api/admin/export]", err);
    return NextResponse.json({ message: "Export failed" }, { status: 500 });
  }
}

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "shape" TEXT,
    "size" TEXT NOT NULL,
    "material" TEXT,
    "finish" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "compareAtPrice" DOUBLE PRECISION,
    "startingStock" INTEGER NOT NULL,
    "description" TEXT,
    "mainImageUrl" TEXT NOT NULL,
    "additionalImageUrls" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

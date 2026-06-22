/*
  Warnings:

  - You are about to drop the `Band` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Price` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PriceOverride` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tariff` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Term` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Band" DROP CONSTRAINT "Band_tariffId_fkey";

-- DropForeignKey
ALTER TABLE "Price" DROP CONSTRAINT "Price_bandId_fkey";

-- DropForeignKey
ALTER TABLE "Price" DROP CONSTRAINT "Price_termId_fkey";

-- DropForeignKey
ALTER TABLE "PriceOverride" DROP CONSTRAINT "PriceOverride_bandId_fkey";

-- DropForeignKey
ALTER TABLE "PriceOverride" DROP CONSTRAINT "PriceOverride_customerId_fkey";

-- DropForeignKey
ALTER TABLE "PriceOverride" DROP CONSTRAINT "PriceOverride_termId_fkey";

-- DropForeignKey
ALTER TABLE "Tariff" DROP CONSTRAINT "Tariff_contractId_fkey";

-- DropForeignKey
ALTER TABLE "Tariff" DROP CONSTRAINT "Tariff_productId_fkey";

-- DropForeignKey
ALTER TABLE "Term" DROP CONSTRAINT "Term_tariffId_fkey";

-- DropTable
DROP TABLE "Band";

-- DropTable
DROP TABLE "Price";

-- DropTable
DROP TABLE "PriceOverride";

-- DropTable
DROP TABLE "Tariff";

-- DropTable
DROP TABLE "Term";

-- CreateTable
CREATE TABLE "tariff" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contractId" TEXT,

    CONSTRAINT "tariff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "term" (
    "id" TEXT NOT NULL,
    "tariffId" TEXT NOT NULL,
    "months" INTEGER NOT NULL,

    CONSTRAINT "term_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "band" (
    "id" TEXT NOT NULL,
    "tariffId" TEXT NOT NULL,
    "minUsers" INTEGER NOT NULL,
    "maxUsers" INTEGER,
    "basePrice12m" DECIMAL(10,2) NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "band_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price" (
    "id" TEXT NOT NULL,
    "bandId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_override" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "bandId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "price_override_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "price_bandId_termId_key" ON "price"("bandId", "termId");

-- CreateIndex
CREATE UNIQUE INDEX "price_override_customerId_bandId_termId_key" ON "price_override"("customerId", "bandId", "termId");

-- AddForeignKey
ALTER TABLE "tariff" ADD CONSTRAINT "tariff_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff" ADD CONSTRAINT "tariff_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "term" ADD CONSTRAINT "term_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "tariff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "band" ADD CONSTRAINT "band_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "tariff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price" ADD CONSTRAINT "price_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "band"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price" ADD CONSTRAINT "price_termId_fkey" FOREIGN KEY ("termId") REFERENCES "term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_override" ADD CONSTRAINT "price_override_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_override" ADD CONSTRAINT "price_override_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "band"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_override" ADD CONSTRAINT "price_override_termId_fkey" FOREIGN KEY ("termId") REFERENCES "term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

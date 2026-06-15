/*
  Warnings:

  - You are about to drop the column `tariffId` on the `product` table. All the data in the column will be lost.
  - You are about to drop the `tariff` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tariff_config` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tariff_customer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_tariffId_fkey";

-- DropForeignKey
ALTER TABLE "tariff_config" DROP CONSTRAINT "tariff_config_contractId_fkey";

-- DropForeignKey
ALTER TABLE "tariff_config" DROP CONSTRAINT "tariff_config_tariffId_fkey";

-- DropForeignKey
ALTER TABLE "tariff_customer" DROP CONSTRAINT "tariff_customer_contractId_fkey";

-- DropForeignKey
ALTER TABLE "tariff_customer" DROP CONSTRAINT "tariff_customer_customerId_fkey";

-- DropForeignKey
ALTER TABLE "tariff_customer" DROP CONSTRAINT "tariff_customer_productId_fkey";

-- DropForeignKey
ALTER TABLE "tariff_customer" DROP CONSTRAINT "tariff_customer_tariffId_fkey";

-- DropIndex
DROP INDEX "product_tariffId_idx";

-- AlterTable
ALTER TABLE "product" DROP COLUMN "tariffId";

-- DropTable
DROP TABLE "tariff";

-- DropTable
DROP TABLE "tariff_config";

-- DropTable
DROP TABLE "tariff_customer";

-- CreateTable
CREATE TABLE "Tariff" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contractId" TEXT,

    CONSTRAINT "Tariff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Term" (
    "id" TEXT NOT NULL,
    "tariffId" TEXT NOT NULL,
    "months" INTEGER NOT NULL,

    CONSTRAINT "Term_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Band" (
    "id" TEXT NOT NULL,
    "tariffId" TEXT NOT NULL,
    "minUsers" INTEGER NOT NULL,
    "maxUsers" INTEGER,
    "basePrice12m" DECIMAL(10,2) NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Band_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Price" (
    "id" TEXT NOT NULL,
    "bandId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceOverride" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "bandId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "PriceOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Price_bandId_termId_key" ON "Price"("bandId", "termId");

-- CreateIndex
CREATE UNIQUE INDEX "PriceOverride_customerId_bandId_termId_key" ON "PriceOverride"("customerId", "bandId", "termId");

-- AddForeignKey
ALTER TABLE "Tariff" ADD CONSTRAINT "Tariff_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tariff" ADD CONSTRAINT "Tariff_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Term" ADD CONSTRAINT "Term_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "Tariff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Band" ADD CONSTRAINT "Band_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "Tariff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceOverride" ADD CONSTRAINT "PriceOverride_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceOverride" ADD CONSTRAINT "PriceOverride_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceOverride" ADD CONSTRAINT "PriceOverride_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

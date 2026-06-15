/*
  Warnings:

  - You are about to drop the column `contractId` on the `tariff` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `tariff` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `tariff` table. All the data in the column will be lost.
  - You are about to drop the `band` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `price` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `price_override` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `term` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `tariff` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "band" DROP CONSTRAINT "band_tariffId_fkey";

-- DropForeignKey
ALTER TABLE "price" DROP CONSTRAINT "price_bandId_fkey";

-- DropForeignKey
ALTER TABLE "price" DROP CONSTRAINT "price_termId_fkey";

-- DropForeignKey
ALTER TABLE "price_override" DROP CONSTRAINT "price_override_bandId_fkey";

-- DropForeignKey
ALTER TABLE "price_override" DROP CONSTRAINT "price_override_customerId_fkey";

-- DropForeignKey
ALTER TABLE "price_override" DROP CONSTRAINT "price_override_termId_fkey";

-- DropForeignKey
ALTER TABLE "tariff" DROP CONSTRAINT "tariff_contractId_fkey";

-- DropForeignKey
ALTER TABLE "tariff" DROP CONSTRAINT "tariff_productId_fkey";

-- DropForeignKey
ALTER TABLE "term" DROP CONSTRAINT "term_tariffId_fkey";

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "tariffId" TEXT;

-- AlterTable
ALTER TABLE "tariff" DROP COLUMN "contractId",
DROP COLUMN "name",
DROP COLUMN "productId",
ADD COLUMN     "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- DropTable
DROP TABLE "band";

-- DropTable
DROP TABLE "price";

-- DropTable
DROP TABLE "price_override";

-- DropTable
DROP TABLE "term";

-- CreateTable
CREATE TABLE "tariff_config" (
    "id" TEXT NOT NULL,
    "tariffId" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 12,
    "min_quantity" INTEGER NOT NULL,
    "max_quantity" INTEGER,
    "price" INTEGER NOT NULL,

    CONSTRAINT "tariff_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tariff_customer" (
    "id" TEXT NOT NULL,
    "tariffId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 12,
    "min_quantity" INTEGER NOT NULL,
    "max_quantity" INTEGER,
    "price" INTEGER NOT NULL,

    CONSTRAINT "tariff_customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tariff_config_tariffId_contractId_duration_min_quantity_key" ON "tariff_config"("tariffId", "contractId", "duration", "min_quantity");

-- CreateIndex
CREATE UNIQUE INDEX "tariff_customer_tariffId_productId_customerId_contractId_du_key" ON "tariff_customer"("tariffId", "productId", "customerId", "contractId", "duration", "min_quantity");

-- CreateIndex
CREATE INDEX "product_tariffId_idx" ON "product"("tariffId");

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "tariff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_config" ADD CONSTRAINT "tariff_config_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "tariff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_config" ADD CONSTRAINT "tariff_config_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_customer" ADD CONSTRAINT "tariff_customer_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "tariff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_customer" ADD CONSTRAINT "tariff_customer_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_customer" ADD CONSTRAINT "tariff_customer_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_customer" ADD CONSTRAINT "tariff_customer_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

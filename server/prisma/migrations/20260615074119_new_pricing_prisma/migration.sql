/*
  Warnings:

  - You are about to drop the column `tariffId` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `tariff` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `tariff` table. All the data in the column will be lost.
  - You are about to drop the `tariff_config` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tariff_customer` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `contractId` to the `tariff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `tariff` table without a default value. This is not possible if the table is not empty.

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

-- AlterTable
ALTER TABLE "tariff" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "contractId" TEXT NOT NULL,
ADD COLUMN     "productId" TEXT NOT NULL,
ADD COLUMN     "terms" INTEGER[] DEFAULT ARRAY[12, 24, 36]::INTEGER[];

-- DropTable
DROP TABLE "tariff_config";

-- DropTable
DROP TABLE "tariff_customer";

-- CreateTable
CREATE TABLE "tariff_row" (
    "id" TEXT NOT NULL,
    "tariffId" TEXT NOT NULL,
    "min_quantity" INTEGER NOT NULL,
    "max_quantity" INTEGER NOT NULL,

    CONSTRAINT "tariff_row_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tariff_cell" (
    "id" TEXT NOT NULL,
    "rowId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "tariff_cell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tariff_cell_customer_price" (
    "id" TEXT NOT NULL,
    "cellId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "tariff_cell_customer_price_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tariff" ADD CONSTRAINT "tariff_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff" ADD CONSTRAINT "tariff_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_row" ADD CONSTRAINT "tariff_row_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "tariff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_cell" ADD CONSTRAINT "tariff_cell_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "tariff_row"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_cell_customer_price" ADD CONSTRAINT "tariff_cell_customer_price_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "tariff_cell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_cell_customer_price" ADD CONSTRAINT "tariff_cell_customer_price_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

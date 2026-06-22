/*
  Warnings:

  - You are about to drop the column `terms` on the `tariff` table. All the data in the column will be lost.
  - You are about to drop the column `validFrom` on the `tariff` table. All the data in the column will be lost.
  - You are about to drop the column `validTo` on the `tariff` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `tariff_cell` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `tariff_cell` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `tariff_row` table. All the data in the column will be lost.
  - You are about to drop the `tariff_cell_customer_price` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[productId,contractId]` on the table `tariff` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[rowId,columnId]` on the table `tariff_cell` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `net_amount` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `columnId` to the `tariff_cell` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tariffId` to the `tariff_cell` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tariff_cell_customer_price" DROP CONSTRAINT "tariff_cell_customer_price_cellId_fkey";

-- DropForeignKey
ALTER TABLE "tariff_cell_customer_price" DROP CONSTRAINT "tariff_cell_customer_price_customerId_fkey";

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "net_amount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "tariff" DROP COLUMN "terms",
DROP COLUMN "validFrom",
DROP COLUMN "validTo";

-- AlterTable
ALTER TABLE "tariff_cell" DROP COLUMN "order",
DROP COLUMN "price",
ADD COLUMN     "columnId" TEXT NOT NULL,
ADD COLUMN     "tariffId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tariff_row" DROP COLUMN "order",
ALTER COLUMN "max_quantity" DROP NOT NULL;

-- DropTable
DROP TABLE "tariff_cell_customer_price";

-- CreateTable
CREATE TABLE "tariff_column" (
    "id" TEXT NOT NULL,
    "tariffId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tariff_column_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tariff_cell_default" (
    "id" TEXT NOT NULL,
    "cellId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tariff_cell_default_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tariff_cell_customer" (
    "id" TEXT NOT NULL,
    "cellId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tariff_cell_customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tariff_history" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tariff_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tariff_history_productId_contractId_version_key" ON "tariff_history"("productId", "contractId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "tariff_productId_contractId_key" ON "tariff"("productId", "contractId");

-- CreateIndex
CREATE UNIQUE INDEX "tariff_cell_rowId_columnId_key" ON "tariff_cell"("rowId", "columnId");

-- AddForeignKey
ALTER TABLE "tariff_column" ADD CONSTRAINT "tariff_column_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "tariff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_cell" ADD CONSTRAINT "tariff_cell_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "tariff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_cell" ADD CONSTRAINT "tariff_cell_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "tariff_column"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_cell_default" ADD CONSTRAINT "tariff_cell_default_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "tariff_cell"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_cell_customer" ADD CONSTRAINT "tariff_cell_customer_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "tariff_cell"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_cell_customer" ADD CONSTRAINT "tariff_cell_customer_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

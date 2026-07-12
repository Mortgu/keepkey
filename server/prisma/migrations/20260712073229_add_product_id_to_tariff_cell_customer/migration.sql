/*
  Warnings:

  - A unique constraint covering the columns `[cellId,customerId,productId]` on the table `tariff_cell_customer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "tariff_cell_customer_cellId_customerId_key";

-- AlterTable
ALTER TABLE "tariff_cell_customer" ADD COLUMN     "productId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "tariff_cell_customer_cellId_customerId_productId_key" ON "tariff_cell_customer"("cellId", "customerId", "productId");

-- AddForeignKey
ALTER TABLE "tariff_cell_customer" ADD CONSTRAINT "tariff_cell_customer_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

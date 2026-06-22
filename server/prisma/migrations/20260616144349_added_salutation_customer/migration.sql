/*
  Warnings:

  - A unique constraint covering the columns `[cellId,customerId]` on the table `tariff_cell_customer_price` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "customer" ADD COLUMN     "salutation" TEXT DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "tariff_cell_customer_price_cellId_customerId_key" ON "tariff_cell_customer_price"("cellId", "customerId");

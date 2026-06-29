/*
  Warnings:

  - A unique constraint covering the columns `[cellId,customerId]` on the table `tariff_cell_customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cellId]` on the table `tariff_cell_default` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tariff_cell_customer_cellId_customerId_key" ON "tariff_cell_customer"("cellId", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "tariff_cell_default_cellId_key" ON "tariff_cell_default"("cellId");

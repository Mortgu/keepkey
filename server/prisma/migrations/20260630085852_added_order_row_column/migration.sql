/*
  Warnings:

  - A unique constraint covering the columns `[tariffId,order]` on the table `tariff_column` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tariffId,order]` on the table `tariff_row` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order` to the `tariff_column` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `tariff_row` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tariff_column" ADD COLUMN     "order" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "tariff_row" ADD COLUMN     "order" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tariff_column_tariffId_order_key" ON "tariff_column"("tariffId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "tariff_row_tariffId_order_key" ON "tariff_row"("tariffId", "order");

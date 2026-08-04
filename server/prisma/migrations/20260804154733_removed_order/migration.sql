/*
  Warnings:

  - You are about to drop the column `order` on the `tariff_column` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `tariff_row` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "tariff_column_tariffId_order_key";

-- DropIndex
DROP INDEX "tariff_row_tariffId_order_key";

-- AlterTable
ALTER TABLE "tariff_column" DROP COLUMN "order";

-- AlterTable
ALTER TABLE "tariff_row" DROP COLUMN "order";

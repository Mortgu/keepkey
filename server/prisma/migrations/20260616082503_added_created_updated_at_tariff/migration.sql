/*
  Warnings:

  - Added the required column `updatedAt` to the `tariff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `tariff_cell` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `tariff_cell_customer_price` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `tariff_row` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tariff_cell" DROP CONSTRAINT "tariff_cell_rowId_fkey";

-- DropForeignKey
ALTER TABLE "tariff_row" DROP CONSTRAINT "tariff_row_tariffId_fkey";

-- AlterTable
ALTER TABLE "tariff" ADD COLUMN     "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "tariff_cell" ADD COLUMN     "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "tariff_cell_customer_price" ADD COLUMN     "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "tariff_row" ADD COLUMN     "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- AddForeignKey
ALTER TABLE "tariff_row" ADD CONSTRAINT "tariff_row_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "tariff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_cell" ADD CONSTRAINT "tariff_cell_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "tariff_row"("id") ON DELETE CASCADE ON UPDATE CASCADE;

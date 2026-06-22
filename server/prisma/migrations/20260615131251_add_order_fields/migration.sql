-- AlterTable
ALTER TABLE "tariff_cell" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "tariff_row" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

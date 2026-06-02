/*
  Warnings:

  - You are about to drop the column `discount` on the `order_position` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `order_position` table. All the data in the column will be lost.
  - You are about to drop the column `unit_price` on the `order_position` table. All the data in the column will be lost.
  - Added the required column `total_cents` to the `order_position` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order_position" DROP COLUMN "discount",
DROP COLUMN "total",
DROP COLUMN "unit_price",
ADD COLUMN     "optional" BOOLEAN DEFAULT false,
ADD COLUMN     "total_cents" INTEGER NOT NULL;

/*
  Warnings:

  - You are about to drop the column `duration_months` on the `offer_position` table. All the data in the column will be lost.
  - You are about to drop the column `duration_months` on the `order_position` table. All the data in the column will be lost.
  - Added the required column `duration` to the `order_position` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "offer_position" DROP COLUMN "duration_months",
ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "order_position" DROP COLUMN "duration_months",
ADD COLUMN     "duration" INTEGER NOT NULL;

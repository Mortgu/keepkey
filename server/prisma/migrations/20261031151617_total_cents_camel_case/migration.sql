/*
  Warnings:

  - You are about to drop the column `total_cents` on the `flat_rate` table. All the data in the column will be lost.
  - You are about to drop the column `total_cents` on the `offer_flat_rate` table. All the data in the column will be lost.
  - Added the required column `totalCents` to the `offer_flat_rate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "flat_rate" DROP COLUMN "total_cents",
ADD COLUMN     "totalCents" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "offer_flat_rate" DROP COLUMN "total_cents",
ADD COLUMN     "totalCents" INTEGER NOT NULL;

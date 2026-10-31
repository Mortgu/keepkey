/*
  Warnings:

  - You are about to drop the column `discount_cents` on the `offer_position` table. All the data in the column will be lost.
  - You are about to drop the column `eur_user_month` on the `offer_position` table. All the data in the column will be lost.
  - You are about to drop the column `free_months` on the `offer_position` table. All the data in the column will be lost.
  - You are about to drop the column `total_cents` on the `offer_position` table. All the data in the column will be lost.
  - Added the required column `eurUserMonth` to the `offer_position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalCents` to the `offer_position` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "offer_position" DROP COLUMN "discount_cents",
DROP COLUMN "eur_user_month",
DROP COLUMN "free_months",
DROP COLUMN "total_cents",
ADD COLUMN     "discountCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "eurUserMonth" INTEGER NOT NULL,
ADD COLUMN     "freeMonths" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalCents" INTEGER NOT NULL;

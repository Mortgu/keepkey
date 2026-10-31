/*
  Warnings:

  - You are about to drop the column `amount_cents` on the `offer_discount` table. All the data in the column will be lost.
  - Added the required column `totalCents` to the `offer_discount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "offer_discount" DROP COLUMN "amount_cents",
ADD COLUMN     "totalCents" INTEGER NOT NULL;

/*
  Warnings:

  - You are about to drop the column `eurUserMonth` on the `offer_position` table. All the data in the column will be lost.
  - Added the required column `unitCents` to the `offer_position` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "offer_position" DROP COLUMN "eurUserMonth",
ADD COLUMN     "unitCents" INTEGER NOT NULL;

/*
  Warnings:

  - Added the required column `eur_user_month` to the `offer_position` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "offer_position" ADD COLUMN     "eur_user_month" INTEGER NOT NULL;

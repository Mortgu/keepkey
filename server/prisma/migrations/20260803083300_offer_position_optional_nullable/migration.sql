/*
  Warnings:

  - Made the column `optional` on table `offer_position` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "offer_position" ALTER COLUMN "optional" SET NOT NULL;

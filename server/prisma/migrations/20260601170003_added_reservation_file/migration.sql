/*
  Warnings:

  - Added the required column `reservationFile` to the `offer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "offer" ADD COLUMN     "reservationFile" TEXT NOT NULL;

/*
  Warnings:

  - You are about to drop the column `net_amount` on the `offer` table. All the data in the column will be lost.
  - Added the required column `netAmount` to the `offer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "offer" DROP COLUMN "net_amount",
ADD COLUMN     "netAmount" INTEGER NOT NULL;

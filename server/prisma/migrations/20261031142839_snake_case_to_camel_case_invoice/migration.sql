/*
  Warnings:

  - You are about to drop the column `gross_cents` on the `invoice` table. All the data in the column will be lost.
  - You are about to drop the column `net_cents` on the `invoice` table. All the data in the column will be lost.
  - You are about to drop the column `vat_cents` on the `invoice` table. All the data in the column will be lost.
  - Added the required column `grossCents` to the `invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `netCents` to the `invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vatCents` to the `invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invoice" DROP COLUMN "gross_cents",
DROP COLUMN "net_cents",
DROP COLUMN "vat_cents",
ADD COLUMN     "grossCents" INTEGER NOT NULL,
ADD COLUMN     "netCents" INTEGER NOT NULL,
ADD COLUMN     "vatCents" INTEGER NOT NULL;

/*
  Warnings:

  - You are about to drop the `offer_revision` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_revision` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "offer_revision" DROP CONSTRAINT "offer_revision_changedById_fkey";

-- DropForeignKey
ALTER TABLE "offer_revision" DROP CONSTRAINT "offer_revision_offerId_fkey";

-- DropForeignKey
ALTER TABLE "order_revision" DROP CONSTRAINT "order_revision_changedById_fkey";

-- DropForeignKey
ALTER TABLE "order_revision" DROP CONSTRAINT "order_revision_orderId_fkey";

-- DropTable
DROP TABLE "offer_revision";

-- DropTable
DROP TABLE "order_revision";

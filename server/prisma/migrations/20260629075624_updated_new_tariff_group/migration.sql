/*
  Warnings:

  - You are about to drop the column `productId` on the `tariff_group` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `tariff_group` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tariff_group" DROP CONSTRAINT "tariff_group_productId_fkey";

-- AlterTable
ALTER TABLE "tariff_group" DROP COLUMN "productId",
ADD COLUMN     "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- CreateTable
CREATE TABLE "tariff_group_product" (
    "id" TEXT NOT NULL,
    "tariffGroupId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tariff_group_product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tariff_group_product_productId_key" ON "tariff_group_product"("productId");

-- AddForeignKey
ALTER TABLE "tariff_group_product" ADD CONSTRAINT "tariff_group_product_tariffGroupId_fkey" FOREIGN KEY ("tariffGroupId") REFERENCES "tariff_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_group_product" ADD CONSTRAINT "tariff_group_product_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `productId` on the `tariff` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tariffGroupId,contractId]` on the table `tariff` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tariffGroupId` to the `tariff` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tariff" DROP CONSTRAINT "tariff_productId_fkey";

-- DropIndex
DROP INDEX "tariff_productId_contractId_key";

-- AlterTable
ALTER TABLE "tariff" DROP COLUMN "productId",
ADD COLUMN     "tariffGroupId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "tariff_group" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "tariff_group_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tariff_tariffGroupId_contractId_key" ON "tariff"("tariffGroupId", "contractId");

-- AddForeignKey
ALTER TABLE "tariff_group" ADD CONSTRAINT "tariff_group_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff" ADD CONSTRAINT "tariff_tariffGroupId_fkey" FOREIGN KEY ("tariffGroupId") REFERENCES "tariff_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

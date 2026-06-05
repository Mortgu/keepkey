/*
  Warnings:

  - You are about to drop the column `features` on the `contract` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `contract` table. All the data in the column will be lost.
  - You are about to drop the column `table` on the `contract` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `flat_rate` table. All the data in the column will be lost.
  - You are about to drop the column `table` on the `flat_rate` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `table` on the `product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `contract` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[key]` on the table `flat_rate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[key]` on the table `product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `flat_rate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `product` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "product_name_idx";

-- DropIndex
DROP INDEX "product_name_key";

-- AlterTable
ALTER TABLE "contract" DROP COLUMN "features",
DROP COLUMN "name",
DROP COLUMN "table",
ADD COLUMN     "key" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "flat_rate" DROP COLUMN "name",
DROP COLUMN "table",
ADD COLUMN     "key" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "product" DROP COLUMN "description",
DROP COLUMN "name",
DROP COLUMN "table",
ADD COLUMN     "key" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "product_translation" (
    "productId" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "table" TEXT,

    CONSTRAINT "product_translation_pkey" PRIMARY KEY ("productId","language")
);

-- CreateTable
CREATE TABLE "flat_rate_translation" (
    "flatRateId" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "name" TEXT NOT NULL,
    "table" TEXT NOT NULL,

    CONSTRAINT "flat_rate_translation_pkey" PRIMARY KEY ("flatRateId","language")
);

-- CreateTable
CREATE TABLE "contract_translation" (
    "contractId" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "name" TEXT NOT NULL,
    "features" TEXT[],
    "table" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "contract_translation_pkey" PRIMARY KEY ("contractId","language")
);

-- CreateIndex
CREATE INDEX "product_translation_language_name_idx" ON "product_translation"("language", "name");

-- CreateIndex
CREATE UNIQUE INDEX "contract_key_key" ON "contract"("key");

-- CreateIndex
CREATE UNIQUE INDEX "flat_rate_key_key" ON "flat_rate"("key");

-- CreateIndex
CREATE UNIQUE INDEX "product_key_key" ON "product"("key");

-- AddForeignKey
ALTER TABLE "product_translation" ADD CONSTRAINT "product_translation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flat_rate_translation" ADD CONSTRAINT "flat_rate_translation_flatRateId_fkey" FOREIGN KEY ("flatRateId") REFERENCES "flat_rate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_translation" ADD CONSTRAINT "contract_translation_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

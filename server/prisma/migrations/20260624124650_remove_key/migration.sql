/*
  Warnings:

  - You are about to drop the column `key` on the `contract` table. All the data in the column will be lost.
  - You are about to drop the column `key` on the `flat_rate` table. All the data in the column will be lost.
  - You are about to drop the column `key` on the `product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "contract_key_key";

-- DropIndex
DROP INDEX "flat_rate_key_key";

-- DropIndex
DROP INDEX "product_key_key";

-- AlterTable
ALTER TABLE "contract" DROP COLUMN "key";

-- AlterTable
ALTER TABLE "flat_rate" DROP COLUMN "key";

-- AlterTable
ALTER TABLE "product" DROP COLUMN "key";

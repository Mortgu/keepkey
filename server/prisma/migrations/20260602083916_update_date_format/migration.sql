/*
  Warnings:

  - You are about to drop the `app_setting` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `createdAt` on table `contact_person` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `contact_person` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `offer_position` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `offer_position` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `supplier` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `supplier` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `tariff` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `tariff` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "contact_person" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "customer" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "offer" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "offer_position" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "order" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "product" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "supplier" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "tariff" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "task" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(6);

-- DropTable
DROP TABLE "app_setting";

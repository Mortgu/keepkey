/*
  Warnings:

  - Made the column `language` on table `customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `country` on table `customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `currency` on table `customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `taxRate` on table `customer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "customer" ALTER COLUMN "language" SET NOT NULL,
ALTER COLUMN "country" SET NOT NULL,
ALTER COLUMN "currency" SET NOT NULL,
ALTER COLUMN "salutation" DROP DEFAULT,
ALTER COLUMN "taxRate" SET NOT NULL;

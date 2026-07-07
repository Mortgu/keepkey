/*
  Warnings:

  - You are about to drop the column `plz` on the `customer` table. All the data in the column will be lost.
  - Added the required column `zip` to the `customer` table without a default value. This is not possible if the table is not empty.
  - Made the column `street` on table `customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `city` on table `customer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "customer" DROP COLUMN "plz",
ADD COLUMN     "zip" TEXT NOT NULL,
ALTER COLUMN "street" SET NOT NULL,
ALTER COLUMN "city" SET NOT NULL;

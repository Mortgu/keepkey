-- CreateEnum
CREATE TYPE "Language" AS ENUM ('DE', 'EN');

-- AlterTable
ALTER TABLE "offer" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'DE';

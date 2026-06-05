/*
  Warnings:

  - The values [OFFER,ORDER,RENEWAL] on the enum `TaskType` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `target` to the `task` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TaskTarget" AS ENUM ('OFFER', 'ORDER', 'RENEWAL');

-- AlterEnum
BEGIN;
CREATE TYPE "TaskType_new" AS ENUM ('UPLOAD', 'RESERVATION');
ALTER TABLE "task" ALTER COLUMN "type" TYPE "TaskType_new" USING ("type"::text::"TaskType_new");
ALTER TYPE "TaskType" RENAME TO "TaskType_old";
ALTER TYPE "TaskType_new" RENAME TO "TaskType";
DROP TYPE "public"."TaskType_old";
COMMIT;

-- AlterTable
ALTER TABLE "task" ADD COLUMN     "target" "TaskTarget" NOT NULL;

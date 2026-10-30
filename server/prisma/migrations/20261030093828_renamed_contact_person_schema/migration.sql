/*
  Warnings:

  - You are about to drop the `contact_person` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "contact_person" DROP CONSTRAINT "contact_person_customerId_fkey";

-- DropForeignKey
ALTER TABLE "offer" DROP CONSTRAINT "offer_contactPersonId_customerId_fkey";

-- DropTable
DROP TABLE "contact_person";

-- CreateTable
CREATE TABLE "person" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "salutation" TEXT,
    "email" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "person_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "person_customerId_idx" ON "person"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "person_id_customerId_key" ON "person"("id", "customerId");

-- AddForeignKey
ALTER TABLE "offer" ADD CONSTRAINT "offer_contactPersonId_customerId_fkey" FOREIGN KEY ("contactPersonId", "customerId") REFERENCES "person"("id", "customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person" ADD CONSTRAINT "person_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

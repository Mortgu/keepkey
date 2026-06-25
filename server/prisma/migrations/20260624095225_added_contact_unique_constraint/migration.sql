/*
  Warnings:

  - A unique constraint covering the columns `[id,customerId]` on the table `contact_person` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "contact_person_id_customerId_key" ON "contact_person"("id", "customerId");

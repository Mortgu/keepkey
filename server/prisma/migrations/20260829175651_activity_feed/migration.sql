-- CreateEnum
CREATE TYPE "ActivityEntity" AS ENUM ('OFFER', 'ORDER', 'DOCUMENT', 'CUSTOMER', 'TARIFF');

-- CreateTable
CREATE TABLE "activity" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entity" "ActivityEntity" NOT NULL,
    "entityId" TEXT NOT NULL,
    "actorId" TEXT,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "customerId" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_createdAt_id_idx" ON "activity"("createdAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "activity_entity_entityId_createdAt_idx" ON "activity"("entity", "entityId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

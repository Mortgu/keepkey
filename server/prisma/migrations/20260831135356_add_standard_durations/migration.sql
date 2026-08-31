-- CreateTable
CREATE TABLE "standard_duration" (
    "id" TEXT NOT NULL,
    "months" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "standard_duration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "standard_duration_months_key" ON "standard_duration"("months");

-- Backfill: die Liste startet mit genau den Laufzeiten, die heute irgendwo
-- konfiguriert sind. Ohne das wäre sie nach der Migration leer und keine
-- bestehende Tarifspalte mehr über sie erreichbar.
-- gen_random_uuid() statt cuid — die Id ist opak, erzeugt wird sie sonst von Prisma.
INSERT INTO "standard_duration" ("id", "months", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, DISTINCT_DURATION."duration", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (SELECT DISTINCT "duration" FROM "tariff_column") AS DISTINCT_DURATION
ON CONFLICT ("months") DO NOTHING;

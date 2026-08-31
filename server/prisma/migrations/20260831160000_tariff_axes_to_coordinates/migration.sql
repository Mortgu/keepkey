-- Achsen der Preistabelle auf Koordinaten.
--
-- Vorher geprüft (alle drei Bedingungen erfüllt, sonst wäre der Umbau
-- verlustbehaftet): kein Tarif einer Gruppe hat abweichende Mengenstaffeln,
-- es gibt keine verwaisten Zellen und keine Zelle ohne Preis.

-- 1. Standardlaufzeiten auffüllen. Ohne das wären Preise an einer Laufzeit,
--    die nicht in der Liste steht, nach dem Umbau unerreichbar.
INSERT INTO "standard_duration" ("id", "months", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, d."duration", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (SELECT DISTINCT "duration" FROM "tariff_column") AS d
ON CONFLICT ("months") DO NOTHING;

-- 2. Mengenstaffeln an die Gruppe.
CREATE TABLE "tariff_tier" (
    "id" TEXT NOT NULL,
    "tariffGroupId" TEXT NOT NULL,
    "min_quantity" INTEGER NOT NULL,
    "max_quantity" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tariff_tier_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tariff_tier_tariffGroupId_min_quantity_key"
    ON "tariff_tier"("tariffGroupId", "min_quantity");

ALTER TABLE "tariff_tier" ADD CONSTRAINT "tariff_tier_tariffGroupId_fkey"
    FOREIGN KEY ("tariffGroupId") REFERENCES "tariff_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DISTINCT ON macht die Zusammenführung auch dann deterministisch, wenn zwei
-- Tarife derselben Gruppe wider Erwarten abweichende Obergrenzen tragen.
INSERT INTO "tariff_tier" ("id", "tariffGroupId", "min_quantity", "max_quantity", "createdAt", "updatedAt")
SELECT DISTINCT ON (t."tariffGroupId", r."min_quantity")
       gen_random_uuid()::text, t."tariffGroupId", r."min_quantity", r."max_quantity",
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "tariff_row" r
JOIN "tariff" t ON t."id" = r."tariffId"
ORDER BY t."tariffGroupId", r."min_quantity", r."max_quantity" NULLS LAST;

-- 3. Zellen tragen ihre Koordinate und ihren Preis selbst.
ALTER TABLE "tariff_cell"
    ADD COLUMN "duration"     INTEGER,
    ADD COLUMN "min_quantity" INTEGER,
    ADD COLUMN "price"        INTEGER;

UPDATE "tariff_cell" c
SET "duration"     = col."duration",
    "min_quantity" = r."min_quantity",
    "price"        = (SELECT d."price" FROM "tariff_cell_default" d WHERE d."cellId" = c."id")
FROM "tariff_column" col, "tariff_row" r
WHERE col."id" = c."columnId" AND r."id" = c."rowId";

-- Verwaiste und unbepreiste Zellen entfallen: "nicht konfiguriert" heisst ab
-- jetzt, dass keine Zeile existiert.
DELETE FROM "tariff_cell"
WHERE "duration" IS NULL OR "min_quantity" IS NULL OR "price" IS NULL;

ALTER TABLE "tariff_cell"
    ALTER COLUMN "duration"     SET NOT NULL,
    ALTER COLUMN "min_quantity" SET NOT NULL,
    ALTER COLUMN "price"        SET NOT NULL;

ALTER TABLE "tariff_cell" DROP COLUMN "rowId", DROP COLUMN "columnId";

DROP INDEX IF EXISTS "tariff_cell_rowId_columnId_key";
CREATE UNIQUE INDEX "tariff_cell_tariffId_duration_min_quantity_key"
    ON "tariff_cell"("tariffId", "duration", "min_quantity");

-- 4. Die alten Achsen-Tabellen.
DROP TABLE "tariff_cell_default";
DROP TABLE "tariff_row";
DROP TABLE "tariff_column";

-- Die Mengenachse wird global, wie die Laufzeitachse schon ist.
-- Fachlich sind die Staffeln in allen Tarifgruppen identisch; die Migration
-- führt sie zusammen und behält bei Abweichungen die Staffel mit der
-- kleinsten Untergrenze zuerst (DISTINCT ON), damit sie deterministisch bleibt.

CREATE TABLE "standard_tier" (
    "id" TEXT NOT NULL,
    "min_quantity" INTEGER NOT NULL,
    "max_quantity" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "standard_tier_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "standard_tier_min_quantity_key" ON "standard_tier"("min_quantity");

INSERT INTO "standard_tier" ("id", "min_quantity", "max_quantity", "createdAt", "updatedAt")
SELECT DISTINCT ON (t."min_quantity")
       gen_random_uuid()::text, t."min_quantity", t."max_quantity", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "tariff_tier" t
ORDER BY t."min_quantity", t."max_quantity" NULLS LAST;

DROP TABLE "tariff_tier";

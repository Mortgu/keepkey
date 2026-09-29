-- AlterTable
ALTER TABLE "contract" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Bisher angezeigte Reihenfolge (neueste zuerst) übernehmen, damit der
-- vorausgewählte Standard-Tarif sich durch die Migration nicht ändert.
UPDATE "contract" c
SET "sortOrder" = r.rn - 1
FROM (SELECT id, row_number() OVER (ORDER BY "createdAt" DESC) AS rn FROM "contract") r
WHERE c.id = r.id;

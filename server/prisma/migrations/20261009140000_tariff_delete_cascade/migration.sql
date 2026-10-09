-- Preistabellen müssen sich entfernen lassen, auch wenn angenommene Angebote
-- ihre Version angepinnt haben. Deren Positionen sind per Trigger unveränderlich,
-- die Version überlebt deshalb verwaist (tariffId = NULL) und liefert weiter die
-- eingefrorene Staffel. Offene Angebote schützt die Fachlogik (deleteTariff).
ALTER TABLE "tariff_version" ALTER COLUMN "tariffId" DROP NOT NULL;
ALTER TABLE "tariff_version" DROP CONSTRAINT "tariff_version_tariffId_fkey";
ALTER TABLE "tariff_version" ADD CONSTRAINT "tariff_version_tariffId_fkey"
    FOREIGN KEY ("tariffId") REFERENCES "tariff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

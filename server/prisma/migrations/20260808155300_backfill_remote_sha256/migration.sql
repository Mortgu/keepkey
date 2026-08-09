-- DataMigration: Fuer bereits nach Nextcloud uebertragene Artefakte entspricht
-- der dortige Inhalt genau dem in S3 — vor dieser Aenderung gab es keinen Weg,
-- die beiden auseinanderlaufen zu lassen. Ohne diesen Backfill saehe jedes
-- bestehende Dokument faelschlich nach "weicht von Nextcloud ab" aus.
UPDATE "document"
SET "remoteSha256" = "sha256"
WHERE "remotePath" IS NOT NULL
  AND "sha256" IS NOT NULL
  AND "remoteSha256" IS NULL;

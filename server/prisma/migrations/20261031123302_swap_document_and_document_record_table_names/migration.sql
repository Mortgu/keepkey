-- Die Tabellennamen standen vertauscht: `document` enthielt die Artefakte
-- (DocumentArtifact), `document_record` die eigentlichen Dokumente (Document).
-- Historisch gewachsen (document_record kam erst bei der Konsolidierung
-- der vier alten *_document-Tabellen dazu, Migration
-- 20261021224925_consolidate_document_tables). Von Hand geschrieben als reine
-- RENAMEs (keine Spalte, keine Zeile wird angefasst), damit keine Daten verloren
-- gehen — Prisma selbst würde hier Drop+Create vorschlagen.

-- Schritt 1: Artefakt-Tabelle "document" -> "document_artifact"
ALTER TABLE "document" RENAME TO "document_artifact";

ALTER TABLE "document_artifact" RENAME CONSTRAINT "document_pkey" TO "document_artifact_pkey";
ALTER TABLE "document_artifact" RENAME CONSTRAINT "document_documentId_fkey" TO "document_artifact_documentId_fkey";

ALTER INDEX "document_documentId_format_key" RENAME TO "document_artifact_documentId_format_key";
ALTER INDEX "document_objectKey_key" RENAME TO "document_artifact_objectKey_key";
ALTER INDEX "document_remotePath_key" RENAME TO "document_artifact_remotePath_key";

-- Schritt 2: Dokument-Tabelle "document_record" -> "document"
-- (Der Name "document" ist durch Schritt 1 frei; Fremdschlüssel hängen an
-- OIDs, nicht an Namen, und bleiben beim Rename intakt.)
ALTER TABLE "document_record" RENAME TO "document";

ALTER TABLE "document" RENAME CONSTRAINT "document_record_pkey" TO "document_pkey";
ALTER TABLE "document" RENAME CONSTRAINT "document_record_offerId_fkey" TO "document_offerId_fkey";
ALTER TABLE "document" RENAME CONSTRAINT "document_record_orderId_fkey" TO "document_orderId_fkey";
ALTER TABLE "document" RENAME CONSTRAINT "document_record_confirmationId_fkey" TO "document_confirmationId_fkey";
ALTER TABLE "document" RENAME CONSTRAINT "document_record_invoiceId_fkey" TO "document_invoiceId_fkey";
ALTER TABLE "document" RENAME CONSTRAINT "document_record_taskId_fkey" TO "document_taskId_fkey";
ALTER TABLE "document" RENAME CONSTRAINT "document_record_type_owner_check" TO "document_type_owner_check";

ALTER INDEX "document_record_offerId_version_key" RENAME TO "document_offerId_version_key";
ALTER INDEX "document_record_orderId_version_key" RENAME TO "document_orderId_version_key";
ALTER INDEX "document_record_confirmationId_version_key" RENAME TO "document_confirmationId_version_key";
ALTER INDEX "document_record_invoiceId_version_key" RENAME TO "document_invoiceId_version_key";
ALTER INDEX "document_record_taskId_key" RENAME TO "document_taskId_key";

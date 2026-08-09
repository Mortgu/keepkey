import { localized } from "@/lib/i18n-content";
import type { DocumentStatus, Language } from "@keepit/schemas";

interface translatableDocumentStatus {
    language: Language;
    value: string;
    description: string;
}

export function localizeDocumentType(type: DocumentStatus): Array<translatableDocumentStatus> {
    switch (type) {
        case "FAILED":
            return [
                { language: "DE", value: "Fehlgeschlagen", description: "Die Dokumentengenerierung ist Fehlgeschlagen!" },
                { language: "EN", value: "Failed", description: "The document generation failed!" },
            ]
        case "GENERATED":
            return [
                { language: "DE", value: "Generiert", description: "Das Dokument wurde erfolgreich generiert. Ist aber noch nicht in NextCloud!" },
                { language: "EN", value: "Generated", description: "The document was generated successfully but was not uploaded to NextCloud yet!" },
            ]
        case "UPLOADED":
            return [
                { language: "DE", value: "Hochgeladen", description: "Das Dokument wurde erfolgreich hochgeladen." },
                { language: "EN", value: "Uploaded", description: "The document was successfully uploaded!" },
            ]
        case "UPLOADING":
            return [
                { language: "DE", value: "Hochladen", description: "Das Dokument wird zurzeit hochgeladen..." },
                { language: "EN", value: "Uploading", description: "The document is currently beeing uploaded..." },
            ]
        case "PENDING":
            return [
                { language: "DE", value: "Warten", description: "Auf die generierung warten..." },
                { language: "EN", value: "Pending", description: "Waring for generation to start..." },
            ]
        case "PROCESSING":
            return [
                { language: "DE", value: "Verarbeiten", description: "Das document wird verarbeitet..." },
                { language: "EN", value: "Processing", description: "The document is generated..." },
            ]
        default: {
            return []
        }
    }
}

export function getDocumentStatus(type: DocumentStatus, lang: Language, key: keyof translatableDocumentStatus): string {
    return localized(localizeDocumentType(type), lang, key);
}
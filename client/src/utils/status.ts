import { localized } from "@/lib/i18n-content";
import type { DocumentStatus, Language } from "@keepit/schemas";

interface translatableDocumentStatus {
    language: Language;
    value: string;
}

export function localizeDocumentType(type: DocumentStatus): Array<translatableDocumentStatus> {
    switch (type) {
        case "FAILED":
            return [
                { language: "DE", value: "Fehlgeschlagen" },
                { language: "EN", value: "Failed" },
            ]
        case "GENERATED":
            return [
                { language: "DE", value: "Generiert" },
                { language: "EN", value: "Generated" },
            ]
        case "UPLOADED":
            return [
                { language: "DE", value: "Hochgeladen" },
                { language: "EN", value: "Uploaded" },
            ]
        case "UPLOADING":
            return [
                { language: "DE", value: "Hochladen" },
                { language: "EN", value: "Uploading" },
            ]
        case "PENDING":
            return [
                { language: "DE", value: "Warten" },
                { language: "EN", value: "Pending" },
            ]
        case "PROCESSING":
            return [
                { language: "DE", value: "Verarbeiten" },
                { language: "EN", value: "Processing" },
            ]
        default: {
            return []
        }
    }
}

export function getDocumentStatus(type: DocumentStatus, lang: Language): string {
    return localized(localizeDocumentType(type), lang, "value");
}
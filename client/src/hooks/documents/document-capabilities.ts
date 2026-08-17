import { useQuery } from "@tanstack/react-query";
import { fetchDocumentCapabilities } from "./document-api";
import type { DocumentCapabilities, DocumentReplaceBlocker } from "@keepit/schemas";

const documentCapabilityKeys = {
    all: ["documents", "capabilities"] as const,
};

/**
 * Solange nichts geladen ist, gilt das Ersetzen als nicht möglich: Lieber ein
 * kurz deaktivierter Menüpunkt als ein Upload, der im Browser abbricht.
 */
const UNKNOWN: DocumentCapabilities = { canReplaceFiles: false };

/**
 * Ob diese Umgebung das Ersetzen erzeugter Dateien trägt.
 *
 * Die Antwort hängt an der Konfiguration, nicht an Daten — sie darf deshalb
 * lange stehen bleiben.
 */
export function useDocumentCapabilities() {
    const { data, isPending } = useQuery({
        queryKey: documentCapabilityKeys.all,
        queryFn: fetchDocumentCapabilities,
        staleTime: 5 * 60 * 1000,
    });

    const capabilities = data ?? UNKNOWN;

    return {
        canReplaceFiles: capabilities.canReplaceFiles,
        replaceBlocker: capabilities.blocker,
        isLoadingCapabilities: isPending,
    };
}

/** Begründung für den deaktivierten Menüpunkt. */
export function replaceBlockerMessage(blocker: DocumentReplaceBlocker | undefined): string {
    switch (blocker) {
        case "cors_not_configured":
            return "Der Bucket erlaubt keine Uploads von dieser Domain — es fehlt eine CORS-Regel.";
        case "storage_unreachable":
            return "Der Objektspeicher ist nicht erreichbar.";
        case "endpoint_private_network":
            return "Der Objektspeicher ist nur intern erreichbar, nicht aus dem Browser.";
        case "endpoint_loopback":
            return "Der Objektspeicher zeigt auf localhost und ist aus dem Browser nicht erreichbar.";
        default:
            return "Das Ersetzen von Dateien ist in dieser Umgebung nicht verfügbar.";
    }
}

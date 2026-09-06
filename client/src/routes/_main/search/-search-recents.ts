const RECENT_KEY = "keepit:recent-searches";
const RECENT_MAX = 5;

/**
 * Zuletzt gesuchte Begriffe, im Browser des Nutzers.
 *
 * Bewusst Suchbegriffe und keine Treffer-Titel: „Angebot #26001" trifft
 * serverseitig nichts, der Begriff, der zum Treffer geführt hat, schon.
 */
export function loadRecent(): Array<string> {
    try {
        const raw = localStorage.getItem(RECENT_KEY);
        if (!raw) return [];

        const parsed: unknown = JSON.parse(raw);
        return Array.isArray(parsed)
            ? parsed.filter((entry): entry is string => typeof entry === "string").slice(0, RECENT_MAX)
            : [];
    } catch {
        // Privater Modus oder beschädigter Eintrag — ohne Verlauf weiterarbeiten.
        return [];
    }
}

export function saveRecent(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;

    const next = [trimmed, ...loadRecent().filter(entry => entry !== trimmed)].slice(0, RECENT_MAX);

    try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
        // Speicherkontingent voll — der Verlauf ist Komfort, kein Zustand.
    }
}

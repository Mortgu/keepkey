import { prisma } from "../lib/prismaClient.js";
import { AppException } from "../lib/exceptions.js";
import { findFilesById, listUsedIdsInDirectories } from "../lib/nextcloud.js";
import env from "../lib/env.js";

/**
 * Vergabe von Belegnummern.
 *
 * Eine Belegnummer ist 5-stellig: zwei Ziffern Geschaeftsjahr (aus `FISCAL_YEAR_PREFIX`)
 * plus dreistelliger Zaehler — 26000, 26001, ... Sie ist zugleich der Dateipraefix in
 * NextCloud (`26000_AG_Firma_Keepit-...`), weshalb eine freie Nummer *beides* sein muss:
 * unbenutzt in der Datenbank und unbenutzt im Cloud-Verzeichnis. Dort liegen naemlich auch
 * Bestandsdokumente aus der Zeit vor diesem System, zu denen es keinen Datensatz gibt.
 *
 * Die Vergabe reserviert nichts. Zwei parallele Anlagen bekommen denselben Vorschlag; wer
 * zuerst speichert gewinnt, der zweite laeuft in den Unique-Constraint und holt sich einen
 * neuen Vorschlag. Eine einmal gespeicherte Nummer wird nie nachtraeglich geaendert.
 */

const COUNTER_DIGITS = 4;
const MAX_COUNTER = 10 ** COUNTER_DIGITS - 1;

/** Dateien in NextCloud beginnen mit `<5-stellige Nummer>_`. */
const FILE_PREFIX_PATTERN = new RegExp(`^(\\d{${2 + COUNTER_DIGITS}})_`);

const QUOTE_ID_PATTERN = new RegExp(`^\\d{${2 + COUNTER_DIGITS}}$`);

const OFFER_DIRECTORIES = [
    { path: env.NEXTCLOUD_OFFER_PDF_PATH, label: "offer_pdf" },
    { path: env.NEXTCLOUD_OFFER_ORIGINAL_PATH, label: "offer_original" },
];

export type QuoteIdSuggestion = {
    quoteId: string;
    /** false = NextCloud war nicht erreichbar, der Vorschlag beruht allein auf der Datenbank. */
    cloudChecked: boolean;
};

export type QuoteIdConflict = "db" | "cloud" | "format";

export type QuoteIdAvailability = {
    quoteId: string;
    available: boolean;
    conflict: QuoteIdConflict | null;
    cloudChecked: boolean;
};

/* ========== Helpers ========== */

function formatQuoteId(prefix: string, counter: number): string {
    return `${prefix}${String(counter).padStart(COUNTER_DIGITS, "0")}`;
}

/** Zaehleranteil einer Nummer des laufenden Geschaeftsjahres, sonst null. */
function counterOf(quoteId: string, prefix: string): number | null {
    if (!QUOTE_ID_PATTERN.test(quoteId) || !quoteId.startsWith(prefix)) return null;

    const counter = Number(quoteId.slice(prefix.length));
    return Number.isNaN(counter) ? null : counter;
}

/**
 * Hoechste bereits vergebene Nummer des Geschaeftsjahres in der Datenbank.
 *
 * Bei fixer Stellenzahl ist die lexikografische Sortierung mit der numerischen identisch,
 * deshalb reicht `orderBy` statt einer Aggregation ueber Raw-SQL.
 */
async function getHighestCounterInDatabase(prefix: string): Promise<number | null> {
    const latest = await prisma.offer.findFirst({
        where: { quoteId: { startsWith: prefix } },
        orderBy: { quoteId: "desc" },
        select: { quoteId: true },
    });

    return latest ? counterOf(latest.quoteId, prefix) : null;
}

/** Hoechste in NextCloud belegte Nummer des Geschaeftsjahres. */
async function getHighestCounterInCloud(prefix: string): Promise<{ counter: number | null; complete: boolean }> {
    const { ids, complete } = await listUsedIdsInDirectories(OFFER_DIRECTORIES, FILE_PREFIX_PATTERN);

    let highest: number | null = null;
    for (const id of ids) {
        const counter = counterOf(id, prefix);
        if (counter !== null && (highest === null || counter > highest)) highest = counter;
    }

    return { counter: highest, complete };
}

/* ========== Queries ========== */

/**
 * Naechste freie Belegnummer: hoechste vergebene Nummer + 1.
 *
 * Bewusst kein Auffuellen von Luecken — eine Nummer, deren Dokument geloescht wurde, bleibt
 * verbrannt. Sonst koennte eine Nummer zweimal nach draussen gehen.
 */
export async function getNextQuoteId(): Promise<QuoteIdSuggestion> {
    const prefix = env.FISCAL_YEAR_PREFIX;

    const [databaseCounter, cloud] = await Promise.all([
        getHighestCounterInDatabase(prefix),
        getHighestCounterInCloud(prefix),
    ]);

    const highest = Math.max(databaseCounter ?? -1, cloud.counter ?? -1);
    const next = highest + 1;

    if (next > MAX_COUNTER) {
        throw new AppException(
            `Der Nummernkreis für das Geschäftsjahr ${prefix} ist erschöpft!`,
            409,
            "QUOTE_ID_RANGE_EXHAUSTED",
        );
    }

    return { quoteId: formatQuoteId(prefix, next), cloudChecked: cloud.complete };
}

/**
 * Prueft eine konkrete Nummer gegen Datenbank und Cloud.
 *
 * Ist NextCloud nicht erreichbar, wird nicht blockiert: die Nummer gilt als verfuegbar,
 * aber `cloudChecked: false` sagt dem Aufrufer, dass Bestandsdateien ungeprueft blieben.
 */
export async function checkQuoteIdAvailability(quoteId: string): Promise<QuoteIdAvailability> {
    if (!QUOTE_ID_PATTERN.test(quoteId)) {
        return { quoteId, available: false, conflict: "format", cloudChecked: false };
    }

    const existing = await prisma.offer.findUnique({
        where: { quoteId },
        select: { id: true },
    });

    if (existing) {
        return { quoteId, available: false, conflict: "db", cloudChecked: false };
    }

    const cloud = await findFilesById(quoteId, OFFER_DIRECTORIES);

    if (cloud.found) {
        return { quoteId, available: false, conflict: "cloud", cloudChecked: true };
    }

    return { quoteId, available: true, conflict: null, cloudChecked: cloud.complete };
}

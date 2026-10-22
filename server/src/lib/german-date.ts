const MONTHS: Array<[string, ...string[]]> = [
    ["januar", "jan"],
    ["februar", "feb"],
    ["märz", "maerz", "mär", "mrz"],
    ["april", "apr"],
    ["mai"],
    ["juni", "jun"],
    ["juli", "jul"],
    ["august", "aug"],
    ["september", "sep", "sept"],
    ["oktober", "okt"],
    ["november", "nov"],
    ["dezember", "dez"],
];

const monthNumber = (name: string): number | null => {
    const index = MONTHS.findIndex((names) => names.includes(name));
    return index === -1 ? null : index + 1;
};

/**
 * Liest ein Datum, wie es in einem Dokument steht: „01. November 2026“ (so
 * formatiert `formatDate`), „1.11.2026“ oder „2026-11-01“. Liefert `YYYY-MM-DD`
 * oder `null` — auch bei einem Datum, das es nicht gibt („31. Februar 2026“).
 */
export function parseGermanDate(text: string): string | null {
    const value = text.trim().toLowerCase().replace(/\s+/g, " ");

    let year: number, month: number | null, day: number;
    let match: RegExpExecArray | null;
    if ((match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value))) {
        [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
    } else if ((match = /^(\d{1,2})\.\s?(\d{1,2})\.\s?(\d{4})$/.exec(value))) {
        [day, month, year] = [Number(match[1]), Number(match[2]), Number(match[3])];
    } else if ((match = /^(\d{1,2})\.\s?([a-zäöü]+)\.?\s?(\d{4})$/.exec(value))) {
        [day, month, year] = [Number(match[1]), monthNumber(match[2]), Number(match[3])];
    } else {
        return null;
    }
    if (month === null) return null;

    const date = new Date(Date.UTC(year, month - 1, day));
    const valid = date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
    return valid ? date.toISOString().slice(0, 10) : null;
}

/** Entfernt Leerzeichen, damit der Firmenname als Dateinamensegment taugt. */
export function sanitizeCompanyName(companyName: string): string {
    return companyName.replaceAll(" ", "").trim();
}

export function offerBaseName(quoteId: string, companyName: string, products: Array<string>): string {
    return `${quoteId}_AG_${sanitizeCompanyName(companyName)}_Keepit-${products.join("+")}`;
}

/** Für jeden Dokumenttyp gleich: die Versionsnummer steht erst ab der zweiten Fassung im Namen. */
export function withDocumentVersion(baseName: string, version: number): string {
    return version > 1 ? `${baseName}_v${version}` : baseName;
}

/** Entfernt Leerzeichen, damit der Firmenname als Dateinamensegment taugt. */
export function sanitizeCompanyName(companyName: string): string {
    return companyName.replaceAll(" ", "").trim();
}

export function generateOfferDisplayName(quoteId: string, companyName: string, products: Array<string>, version: number): string {
    const formatedWorkloads = products.join("+");

    let name = `${quoteId}_AG_${sanitizeCompanyName(companyName)}_Keepit-${formatedWorkloads}`;

    if (version > 0)
        name = `${name}_v${version}`;

    return name;
}

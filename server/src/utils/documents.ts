/** Entfernt Leerzeichen, damit der Firmenname als Dateinamensegment taugt. */
export function sanitizeCompanyName(companyName: string): string {
    return companyName.replaceAll(" ", "").trim();
}

export function generateOfferDisplayName(quoteNumber: string, companyName: string, products: Array<string>, version: number): string {
    const formatedWorkloads = products.join("+");

    let name = `${quoteNumber}_AG_${sanitizeCompanyName(companyName)}_Keepit-${formatedWorkloads}`;

    if (version > 0)
        name = `${name}_v${version}`;

    return name;
}

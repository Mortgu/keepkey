
export function generateOfferDisplayName(quoteId: string, companyName: string, products: Array<string>, version: number): string {
    const formatedCompanyName = companyName.replaceAll(" ", "").trim();
    const formatedWorkloads = products.join("+");

    let name = `${quoteId}_AG_${formatedCompanyName}_Keepit-${formatedWorkloads}`;

    if (version > 0)
        name = `${name}_v${version}`;

    return name;
}
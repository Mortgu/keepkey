export const formatEur = (cent: number): string => {
    cent = cent / 100;
    return cent.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}


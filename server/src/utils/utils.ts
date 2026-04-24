export const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("de-DE", {
        day: "2-digit", month: "long", year: "numeric"
    })
}

export const formatEur = (value: number): string => {
    return value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}
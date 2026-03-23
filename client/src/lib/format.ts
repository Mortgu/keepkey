export const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("de-DE", {
        day: "2-digit", month: "long", year: "numeric"
    })
}

export const sumItems = (items: { price36Raw: number }[]) => {
    return items?.reduce((acc, i) => acc + i.price36Raw, 0) ?? 0;
}

export const formatCurrency = (value: number) => new Intl.NumberFormat("de-DE", {
    style: "currency", currency: "EUR"
}).format(value);
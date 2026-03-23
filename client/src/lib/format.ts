export const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("de-DE", {
        day: "2-digit", month: "long", year: "numeric"
    })
}
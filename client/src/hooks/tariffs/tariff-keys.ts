export const tariffKeys = {
    all: ["tariffs"] as const,

    lists: () => [...tariffKeys.all, "lists"] as const,
    groups: () => [...tariffKeys.lists(), "groups"] as const,
    group: (id: string) => [...tariffKeys.groups(), id] as const,

    /**
     * Bewusst unterhalb von `all` und nicht von `lists()`: Strukturänderungen
     * invalidieren `all`, damit die Versionsliste (isCurrent!) mitzieht.
     */
    allVersions: () => [...tariffKeys.all, "versions"] as const,
    versions: (tariffId: string) => [...tariffKeys.allVersions(), tariffId] as const,

    /** Global gepflegte Laufzeiten — unabhängig von Produkt und Vertrag. */
    standardDurations: () => [...tariffKeys.all, "standard-durations"] as const,

    /** Global gepflegte Mengenstaffeln — die Zeilenachse aller Preistabellen. */
    standardTiers: () => [...tariffKeys.all, "standard-tiers"] as const,

    durations: (productId: string, contractId: string) =>
        [...tariffKeys.all, "durations", productId, contractId] as const,
};

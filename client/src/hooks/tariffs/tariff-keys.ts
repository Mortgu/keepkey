export const tariffKeys = {
    all: ["tariffs"] as const,

    lists: () => [...tariffKeys.all, "lists"] as const,
    list: (productId?: string) => [...tariffKeys.lists(), productId ?? "all"] as const,

    history: (productId: string, contractId: string) =>
        [...tariffKeys.all, "history", productId, contractId] as const,

    durations: (productId: string, contractId: string) =>
        [...tariffKeys.all, "durations", productId, contractId] as const,
};

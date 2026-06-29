export const tariffKeys = {
    all: ["tariffs"] as const,

    lists: () => [...tariffKeys.all, "lists"] as const,
    groups: () => [...tariffKeys.lists(), "groups"] as const,
    group: (id: string) => [...tariffKeys.groups(), id] as const,

    history: (productId: string, contractId: string) =>
        [...tariffKeys.all, "history", productId, contractId] as const,

    durations: (productId: string, contractId: string) =>
        [...tariffKeys.all, "durations", productId, contractId] as const,
};

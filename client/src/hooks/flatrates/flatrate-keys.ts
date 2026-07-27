export const flatRateKeys = {
    all: ["flatrates"] as const,
    lists: () => [...flatRateKeys.all, "list"] as const,
    list: () => [...flatRateKeys.lists()] as const,
    details: () => [...flatRateKeys.all, "detail"] as const,
    detail: (id: string) => [...flatRateKeys.details(), id] as const,
};

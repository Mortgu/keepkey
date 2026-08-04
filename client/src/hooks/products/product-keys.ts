export const productKeys = {
    all: ["products"] as const,
    lists: () => [...productKeys.all, "list"] as const,
    list: () => [...productKeys.lists()] as const,
    details: () => [...productKeys.all, "detail"] as const,
    detail: (id: string) => [...productKeys.details(), id] as const,
};

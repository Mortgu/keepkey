export const productKeys = {
    all: ["products"] as const,
    lists: () => [...productKeys.all, "list"] as const,
    list: () => [...productKeys.lists()] as const,
    details: () => [...productKeys.all, "detail"] as const,
    detail: (id: string) => [...productKeys.details(), id] as const,

    prices: () => [...productKeys.all, "price"] as const,
    price: (params: { customerId: string; productId: string; contractId: string; duration_months: number; quantity: number; free_months: number }) =>
        [...productKeys.prices(), params] as const,
};

export const flatRateKeys = {
    all: ["flatrates"] as const,
    lists: () => [...flatRateKeys.all, "list"] as const,
    list: () => [...flatRateKeys.lists()] as const,
};

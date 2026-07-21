export const supplierKeys = {
    all: ["suppliers"] as const,
    lists: () => [...supplierKeys.all, "list"] as const,
    list: () => [...supplierKeys.lists()] as const,
};

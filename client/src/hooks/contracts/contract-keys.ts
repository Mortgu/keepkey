export const contractKeys = {
    all: ["contracts"] as const,
    lists: () => [...contractKeys.all, "list"] as const,
}
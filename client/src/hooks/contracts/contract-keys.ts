
export const contractKeys = {
    all: ["contracts"] as const,
    lists: () => [...contractKeys.all, "list"] as const,
    details: () => [...contractKeys.all, "detail"] as const,
    detail: (id: string) => [...contractKeys.details(), id] as const,
}
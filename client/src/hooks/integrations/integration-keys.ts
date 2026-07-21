export const integrationKeys = {
    all: ["integrations"] as const,
    status: () => [...integrationKeys.all, "status"] as const,
};

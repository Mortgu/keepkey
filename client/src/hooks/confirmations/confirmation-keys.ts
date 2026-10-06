export const confirmationKeys = {
    all: ["confirmations"] as const,
    byOrder: (orderId: string) => [...confirmationKeys.all, "order", orderId] as const,
};

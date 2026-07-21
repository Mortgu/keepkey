export const userKeys = {
    all: ["users"] as const,
    lists: () => [...userKeys.all, "list"] as const,
    list: () => [...userKeys.lists()] as const,
    session: () => [...userKeys.all, "session"] as const,
};

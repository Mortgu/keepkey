export const templateKeys = {
    all: ["templates"] as const,
    lists: () => [...templateKeys.all, "list"] as const,
    list: () => [...templateKeys.lists()] as const,

    contents: () => [...templateKeys.all, "content"] as const,
    content: (id: string) => [...templateKeys.contents(), id] as const,
};

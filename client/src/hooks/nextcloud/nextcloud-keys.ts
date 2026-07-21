export const nextcloudKeys = {
    all: ["nextcloud"] as const,
    status: () => [...nextcloudKeys.all, "status"] as const,
    files: (id: string) => [...nextcloudKeys.all, "files", id] as const,
    offerFiles: (id: string) => [...nextcloudKeys.all, "offer", id] as const,
    orderFiles: (id: string) => [...nextcloudKeys.all, "order", id] as const,
    cloud: () => ["cloud"] as const,
    directory: (path: string) => [...nextcloudKeys.cloud(), "directory", path] as const,
    templates: () => [...nextcloudKeys.cloud(), "templates"] as const,
};

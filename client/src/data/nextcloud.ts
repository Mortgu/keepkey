import { api } from "@/lib/api-client";

export type NextcloudPaths = {
    pdfPath: string;
    docxPath: string;
};

export type NextcloudStatus = {
    status: "connected" | "failed" | "auth_expired" | "not_configured";
    detail?: string;
};

export const getNextcloudPathsAction = () =>
    api<NextcloudPaths>("/api/nextcloud/paths", { method: "GET" });

export const saveNextcloudPathsAction = (data: NextcloudPaths) =>
    api<NextcloudPaths>("/api/nextcloud/paths", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

export const getNextcloudStatusAction = () =>
    api<NextcloudStatus>("/api/nextcloud/status", { method: "GET" });

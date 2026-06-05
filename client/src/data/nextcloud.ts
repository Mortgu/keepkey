import { api } from "@/lib/api-client";

export type NextcloudStatus = {
    message: string;
};

export const getNextcloudStatusAction = () =>
    api<NextcloudStatus>("/api/nextcloud/status", { method: "GET" });

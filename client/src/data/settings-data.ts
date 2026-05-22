import { api } from "@/lib/api-client";

export const updateSettingAction = (key: String, value: String) =>
    api<boolean>("/api/settings", {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            key, value
        })
    })
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export class ApiError extends Error {
    status: number;
    code: string;
    constructor(message: string, status: number, code: string = "APP_ERROR") {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
    }
}

export const api = async <T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const { headers, body, ...rest } = options;
    const finalHeaders = new Headers(headers);

    // Default to JSON for request bodies that don't specify a Content-Type
    // (e.g. uploads pass their own Content-Type and are left untouched).
    if (body && !finalHeaders.has("Content-Type")) {
        finalHeaders.set("Content-Type", "application/json");
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        credentials: "include",
        headers: finalHeaders,
        body,
        ...rest,
    });

    const text = await res.text();
    let json: unknown;
    if (text.length > 0) {
        try {
            json = JSON.parse(text);
        } catch {
            throw new ApiError(
                res.ok ? "Response was not valid JSON" : `Unexpected response (status ${res.status})`,
                res.status,
            );
        }
    }

    if (!res.ok) {
        const payload = json as { message?: unknown; code?: unknown } | undefined;
        const message = typeof payload?.message === "string" ? payload.message : "API error";
        const code = typeof payload?.code === "string" ? payload.code : "APP_ERROR";
        throw new ApiError(message, res.status, code);
    }

    return json as T;
};

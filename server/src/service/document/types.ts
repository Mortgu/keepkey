export interface DocumentRequest {
    id: string;
    filename: string;
    content: Buffer;
}


export interface LocationResult {
    locationName: string;
    status: "uploaded" | "already_exists" | "failed";
    error?: string;
}

export interface UploadResult {
    docId: string;
    results: LocationResult[];
    allSuccessful: boolean;
}

interface FtsDocument {
    id: string;
    title: string;          // Dateiname
    link: string;           // URL zur Datei in Nextcloud
    info?: {
        path?: string;        // Pfad relativ zum User-Root
        share?: string[];
    };
    excerpts?: { source: string; excerpt: string }[];
    score?: number;
}

export interface FtsResponse {
    result?: {
        documents?: FtsDocument[];
        total?: number;
        time?: number;
    };
}
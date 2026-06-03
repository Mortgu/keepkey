import NextCloudLocation from "./nextcloud-location.js";
import {LocationResult, UploadResult} from "./types.js";

export default class UploadOrchestrator {
    constructor(private readonly locations: NextCloudLocation[]) {
    }

    async upload(docId: string, filename: string, content: Buffer): Promise<UploadResult> {
        const results = await Promise.allSettled(
            this.locations.map((loc) => this.uploadToLocation(loc, docId, filename, content))
        );

        const locationResults: LocationResult[] = results.map((r) =>
            r.status === "fulfilled" ? r.value : {locationName: "unknown", status: "failed", error: String(r.reason)}
        );

        return {
            docId,
            results: locationResults,
            allSuccessful: locationResults.every((r) => r.status !== "failed"),
        };
    }

    private async uploadToLocation(location: NextCloudLocation, docId: string, filename: string, content: Buffer): Promise<LocationResult> {
        const path = location.buildPath(docId, filename);

        // Idempotenz-Check
        if (await location.fileExists(path)) {
            return {locationName: location.name, status: "already_exists"};
        }

        try {
            await location.ensureDirectory(docId);
            await location.put(path, content);
            return {locationName: location.name, status: "uploaded"};
        } catch (err: any) {
            return {locationName: location.name, status: "failed", error: err.message};
        }
    }
}
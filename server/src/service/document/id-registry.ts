import {NextCloudSearch} from "./nextcloud-search.js";
import {WebDAVClient} from "webdav";

export default class IDRegistry {

    constructor(
        private readonly search: NextCloudSearch,
        private readonly client: WebDAVClient, // für .lock-Dateien
        private readonly registryPath = "/registry"
    ) {

    }

    async exists(id: string): Promise<boolean> {
        return false;
    }
}
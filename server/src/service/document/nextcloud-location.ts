import { AuthType, createClient, WebDAVClient } from "webdav";

export interface LocationConfig {
    name: string;
}

export default class NextCloudLocation {
    public name: string;
    public path: string;

    constructor(
        private readonly client: WebDAVClient,
        name: string,
        path: string,
    ) {
        this.name = name;
        this.path = path;
    }

    buildPath(docId: string, filename: string): string {
        return `${this.path}/${filename}`;
    }

    async fileExists(path: string): Promise<boolean> {
        try {
            await this.client.stat(path);
            return true;
        } catch {
            return false;
        }
    }

    async ensureDirectory(docId: string): Promise<void> {
        const dir = this.path;
        const exists = await this.fileExists(dir);
        if (!exists) {
            await this.client.createDirectory(dir, { recursive: true });
        }
    }

    async put(path: string, content: Buffer): Promise<void> {
        await this.client.putFileContents(path, content, { overwrite: false });
    }
}
import {AuthType, createClient, WebDAVClient} from "webdav";

export interface LocationConfig {
    name: string;
    baseUrl: string;
    username: string;
    password: string;
}

export default class NextCloudLocation {
    public readonly name: string;
    private client: WebDAVClient;

    constructor(config: LocationConfig) {
        this.name = config.name;
        this.client = createClient(config.baseUrl, {
            authType: AuthType.Password,
            username: config.username,
            password: config.password,
        });
    }

    buildPath(docId: string, filename: string): string {
        return `/documents/${docId}/${filename}`;
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
        const dir = `/documents/${docId}`;
        const exists = await this.fileExists(dir);
        if (!exists) {
            await this.client.createDirectory(dir, {recursive: true});
        }
    }

    async put(path: string, content: Buffer): Promise<void> {
        await this.client.putFileContents(path, content, {overwrite: false});
    }
}
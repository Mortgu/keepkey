import {FileStat} from "webdav";
import {fileExists, getNextCloudClient, reserveFile, uploadFile} from "../lib/nextcloud.js";
import {INextCloudRepository} from "./repository.js";

export class NextCloudRepository implements INextCloudRepository {
    async checkConnection(): Promise<boolean> {
        try {
            await getNextCloudClient().getDirectoryContents("/");
            return true;
        } catch {
            return false;
        }
    }

    async fileExists(path: string): Promise<boolean> {
        return fileExists(path);
    }

    async reserveFile(quoteId: string, directoryPath: string): Promise<string> {
        const {filename} = await reserveFile(quoteId, directoryPath);
        return filename;
    }

    async uploadFile(path: string, buffer: Buffer): Promise<void> {
        return uploadFile(path, buffer);
    }

    async listFiles(dir: string): Promise<string[]> {
        const files = (await getNextCloudClient().getDirectoryContents(dir)) as FileStat[];
        return files.map((f) => f.filename);
    }
}

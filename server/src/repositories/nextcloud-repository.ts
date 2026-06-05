import { FileStat } from "webdav";
import { fileExists, getNextCloudClient, reserveFile, uploadFile } from "../lib/nextcloud.js";
import { INextCloudRepository } from "./repository.js";
import * as Buffer from "node:buffer";
import { AppException } from "../exceptions/exceptions.js";

export class NextCloudRepository implements INextCloudRepository {
    async checkConnection(): Promise<boolean> {
        try {
            await getNextCloudClient().getDirectoryContents("/");
            return true;
        } catch {
            return false;
        }
    }

    async checkIdExistence(id: string, path: string): Promise<boolean> {
        try {
            const files: { file: string, filename: string }[] = await this.listFiles(path);
            const fileIds: string[] = files.map((file) => file.filename.split("_")[0]);

            console.log("checkIdExistence", fileIds, id);

            return fileIds.includes(id);
        } catch {
            return true;
        }
    }

    async fileExists(path: string): Promise<boolean> {
        return fileExists(path);
    }

    async reserveFile(id: string, directoryPath: string): Promise<string> {
        const exists = await this.checkIdExistence(id, directoryPath);

        if (exists) {
            throw new AppException(`File with id ${id} already exists in ${directoryPath}!`,
                409, "reserveFile");
        }

        const { filename } = await reserveFile(id, directoryPath);
        return filename;
    }

    async uploadFile(path: string, buffer: Buffer): Promise<void> {
        return uploadFile(path, buffer);
    }

    async listFiles(dir: string): Promise<{ file: string, filename: string }[]> {
        const files = (await getNextCloudClient().getDirectoryContents(dir)) as FileStat[];
        return files.map((f) => ({
            file: f.filename,
            filename: f.basename,
        }));
    }
}

import {IWebDavRepository} from "./repository.js";
import {BufferLike, FileStat} from "webdav";
import BaseRepository from "./base-repository.js";

export class WebdavRepository extends BaseRepository implements IWebDavRepository {
    protected client = super.getWebDavClient();

    async listFiles(dir: string): Promise<string[]> {
        const files: FileStat[] = await this.client.getDirectoryContents(dir);
        return files.map((file) => file.filename);
    }

    async uploadFile(dir: string, fileName: string, content: string | BufferLike): Promise<boolean> {
        try {
            return await this.client.putFileContents(`${dir}/${fileName}`, content);
        } catch (exception) {
            throw new Error(`Error while uploading a webdav client: ${exception}`);
        }
    }
}

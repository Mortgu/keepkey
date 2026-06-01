import BaseRepository, {Constructor} from "./base-repository.js";
import {IWebDavRepository} from "./repository.js";
import {BufferLike, FileStat, WebDAVClient} from "webdav";

export function AddWebDavRepository<TBase extends Constructor<BaseRepository>>(Base: TBase) {
    return class WebDavRepository extends Base implements IWebDavRepository {
        private _client = super.getWebDavClient();

        getClient(): WebDAVClient {
            return this._client;
        }

        async listFiles(dir: string): Promise<string[]> {
            const files: FileStat[] = await this._client.getDirectoryContents(dir);

            return files.map((file) => file.filename);
        }

        async uploadFile(dir: string, fileName: string, content: string | BufferLike): Promise<void> {
            try {
                await this._client.putFileContents(`${dir}/${fileName}`, content);
            } catch (exception) {
                throw new Error(`Error while uploading a webdav client: ${exception}`);
            }
        }
    }
}
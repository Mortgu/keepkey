import {createClient, WebDAVClient} from "webdav";
import env from "../lib/env.js";

export default class BaseRepository {
    protected client: WebDAVClient;
    protected defaultUrl = `${env.NEXTCLOUD_URL}/remote.php/dav/files/${env.NEXTCLOUD_USER}`;

    constructor() {
        this.client = createClient(this.defaultUrl, {
            username: env.NEXTCLOUD_USER,
            password: env.NEXTCLOUD_PASSWORD
        });
    }

    protected getWebDavClient() {
        return this.client;
    }
}

export type Constructor<T = {}> = new (...args: any[]) => T;
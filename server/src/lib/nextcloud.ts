import { createClient, type WebDAVClient } from "webdav";
import env from "./env.js";

let client: WebDAVClient | null = null;

export function getNextCloudClient(): WebDAVClient {
  if (!client) {
    client = createClient(
      `${env.NEXTCLOUD_URL}/remote.php/dav/files/${env.NEXTCLOUD_USER}/`,
      { username: env.NEXTCLOUD_USER, password: env.NEXTCLOUD_PASSWORD },
    );
  }
  return client;
}

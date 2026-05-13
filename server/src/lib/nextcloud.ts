import { createClient, type WebDAVClient } from "webdav";
import env from "./env.js";
import logger from "../middlewares/logger.js";

let client: WebDAVClient | null = null;

export function getNextCloudClient(): WebDAVClient {
  if (!client) {
    client = createClient(env.NEXTCLOUD_URL, {
      username: env.NEXTCLOUD_USER,
      password: env.NEXTCLOUD_PASSWORD,
    });
  }
  return client;
}

export async function uploadToNextCloud(fileName: string, document: Buffer<ArrayBufferLike> | undefined) {
  if (document === undefined) return;

  const client = createClient(`${env.NEXTCLOUD_URL}/remote.php/dav/files/${env.NEXTCLOUD_USER}/`,
    { username: env.NEXTCLOUD_USER, password: env.NEXTCLOUD_PASSWORD },
  );

  try {
    // 1. Dateinamen lesen
    const directoryItems = await client.getDirectoryContents(env.NEXTCLOUD_OFFER_PATH);
    console.log("Dateien im Ordner:");
    directoryItems.forEach((item) => console.log(item.filename));

    // 2. Datei hochladen
    await client.putFileContents(env.NEXTCLOUD_OFFER_PATH + "/" + fileName, document);
    console.log("Upload erfolgreich.");
  } catch (error: any) {
    console.error("Fehler bei der Kommunikation:", error.status);
  }
}

export async function getLatestQuoteId(): Promise<number> {
  const client = createClient(`${env.NEXTCLOUD_URL}/remote.php/dav/files/${env.NEXTCLOUD_USER}/`,
    { username: env.NEXTCLOUD_USER, password: env.NEXTCLOUD_PASSWORD },
  );

  try {
    const dirItems = await client.getDirectoryContents(env.NEXTCLOUD_OFFER_PATH + "/PDF").then((contents) => {
      contents.sort((a, b) => b.basename.localeCompare(a.basename));
      return contents;
    });

    return parseInt(dirItems[0].basename.slice(0, 6));
  } catch (exception: any) {
    logger.error("Error trying to fetch latest quote nummber");
    return 0;
  }
}

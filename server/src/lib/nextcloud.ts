import { createClient, type WebDAVClient } from "webdav";
import env from "./env.js";

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

export async function manageNextcloud() {
  const client = createClient(
    `${env.NEXTCLOUD_URL}/remote.php/dav/files/${env.NEXTCLOUD_USER}/`,
    {
      username: env.NEXTCLOUD_USER,
      password: env.NEXTCLOUD_PASSWORD,
    },
  );

  try {
    // 1. Dateinamen lesen
    const directoryItems = await client.getDirectoryContents("/Documents");
    console.log("Dateien im Ordner:");
    directoryItems.forEach((item) => console.log(item.filename));

    // 2. Datei hochladen
    /*const content = "Hallo Nextcloud, gesendet von Node.js";
        await client.putFileContents("/MeinOrdner/test.txt", content);
        console.log("Upload erfolgreich.");*/
  } catch (error: any) {
    console.error("Fehler bei der Kommunikation:", error.status);
  }
}

import { createClient, type WebDAVClient } from "webdav";
import env from "./env.js";
import logger from "../middlewares/logger.js";

let client: WebDAVClient | null = null;

export function getNextCloudClient(): WebDAVClient {
  if (!client) {
    client = createClient(`${env.NEXTCLOUD_URL}/remote.php/dav/files/${env.NEXTCLOUD_USER}/`, {
      username: env.NEXTCLOUD_USER,
      password: env.NEXTCLOUD_PASSWORD,
    });
  }
  return client;
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    await getNextCloudClient().stat(path);
    return true;
  } catch {
    return false;
  }
}

export async function reserveFile(
  quoteId: string,
  directoryPath: string,
): Promise<void> {
  const filePath = `${directoryPath}/${quoteId}.reserved`;

  const exists = await fileExists(filePath);
  if (exists) {
    logger.info(`[nextcloud] reservation file already exists: ${filePath}`);
    return;
  }

  try {
    await getNextCloudClient().putFileContents(filePath, new ArrayBuffer(0));
    logger.info(`[nextcloud] reservation file created: ${filePath}`);
  } catch (exception: any) {
    throw new Error(
      `NextCloud directory "${directoryPath}" not found or unreachable: ${exception.message}`,
    );
  }
}

export async function uploadFile(
  path: string,
  buffer: Buffer,
): Promise<void> {
  const exists = await fileExists(path);
  if (exists) {
    throw new Error(`File already exists in NextCloud: ${path}`);
  }

  try {
    await getNextCloudClient().putFileContents(path, buffer);
    logger.info(`[nextcloud] file uploaded: ${path}`);
  } catch (exception: any) {
    throw new Error(
      `NextCloud upload to "${path}" failed: ${exception.message}`,
    );
  }
}

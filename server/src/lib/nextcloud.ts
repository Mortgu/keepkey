import { createClient, type WebDAVClient } from "webdav";
import env from "./env.js";
import logger from "../middlewares/logger.js";

export class NextCloudError extends Error {
  constructor(message: string, public readonly status?: number, public readonly cause?: unknown) {
    super(message);
    this.name = "NextCloudError";
  }
}

export class QuoteIdAlreadyReservedError extends NextCloudError {
  constructor(public readonly quoteId: string) {
    super(`QuoteId ${quoteId} is already reserved in NextCloud`, 412);
    this.name = "QuoteIdAlreadyReservedError";
  }
}

let client: WebDAVClient | null = null;

function getClient(): WebDAVClient {
  if (!client) {
    client = createClient(
      `${env.NEXTCLOUD_URL}/remote.php/dav/files/${env.NEXTCLOUD_USER}/`,
      { username: env.NEXTCLOUD_USER, password: env.NEXTCLOUD_PASSWORD },
    );
  }
  return client;
}

export async function uploadToNextCloud(
  fileName: string,
  document: Buffer<ArrayBufferLike> | undefined,
) {
  if (document === undefined) return;

  try {
    await getClient().putFileContents(
      `${env.NEXTCLOUD_OFFER_PATH}/${fileName}`,
      document,
    );
    logger.info(`NextCloud upload successful: ${fileName}`);
  } catch (error: any) {
    logger.error(`NextCloud upload failed for ${fileName}: ${error?.message ?? error}`);
    throw new NextCloudError(
      `Upload failed for ${fileName}: ${error?.message ?? error}`,
      error?.status,
      error,
    );
  }
}

export async function reserveQuoteIdInNextCloud(quoteId: string): Promise<void> {

}

export async function getLatestQuoteId(): Promise<number> {
  const c = getClient();

  const [pdfItems, reservedItems] = await Promise.all([
    c.getDirectoryContents(`${env.NEXTCLOUD_OFFER_PATH}/PDF`).catch((e: any) => {
      logger.error(`Failed to read PDF dir: ${e?.message ?? e}`);
      throw new NextCloudError(`Failed to read PDF dir: ${e?.message ?? e}`, e?.status, e);
    }),
    c.getDirectoryContents(env.NEXTCLOUD_OFFER_PATH).catch((e: any) => {
      logger.error(`Failed to read offer dir: ${e?.message ?? e}`);
      throw new NextCloudError(`Failed to read offer dir: ${e?.message ?? e}`, e?.status, e);
    }),
  ]);

  const ids: number[] = [];

  for (const item of Array.isArray(pdfItems) ? pdfItems : []) {
    const n = parseInt(item.basename.slice(0, 6), 10);
    if (!Number.isNaN(n)) ids.push(n);
  }

  for (const item of Array.isArray(reservedItems) ? reservedItems : []) {
    if (!item.basename.endsWith(".reserved")) continue;
    const n = parseInt(item.basename.slice(0, 6), 10);
    if (!Number.isNaN(n)) ids.push(n);
  }

  return ids.length > 0 ? Math.max(...ids) : 0;
}

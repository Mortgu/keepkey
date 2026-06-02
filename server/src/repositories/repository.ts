import { BufferLike } from "webdav";

export interface INextCloudRepository {
  checkConnection(): Promise<boolean>;
  fileExists(path: string): Promise<boolean>;
  reserveFile(quoteId: string, directoryPath: string): Promise<string>;
  uploadFile(path: string, buffer: Buffer): Promise<void>;
  listFiles(dir: string): Promise<string[]>;
}

export interface IWebDavRepository {
  listFiles(dir: string): Promise<string[]>;
  uploadFile(dir: string, fileName: string, content: string | BufferLike): Promise<boolean>;
}

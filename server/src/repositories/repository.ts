import {BufferLike} from "webdav";

export interface INextCloudRepository {
    /* Fn to create a reservation file in a directory */
    createReservation(dir: string, id: string): Promise<string | null>;
}

export interface IWebDavRepository {
    /* List all the files in a given folder. */
    listFiles(dir: string): Promise<string[]>;

    /* Function for uploading a file */
    uploadFile(dir: string, fileName: string, content: string | BufferLike): Promise<boolean>;
}
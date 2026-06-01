import {INextCloudRepository} from "./repository.js";
import {WebdavRepository} from "./webdav-repository.js";

export class NextcloudRepository extends WebdavRepository implements INextCloudRepository {
    async createReservation(dir: string, id: string): Promise<void> {
        await super.uploadFile(dir, `${id}.reserved`, "This is a auto generated reservation file!");
    }
}
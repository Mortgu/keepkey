import {INextCloudRepository, IWebDavRepository} from "./repository.js";
import {Constructor} from "./base-repository.js";

export function AddNextCloudRepository<TBase extends Constructor<IWebDavRepository>>(Base: TBase) {
    return class NextCloudRepository extends Base implements INextCloudRepository {

        async createReservation(dir: string, id: string): Promise<void> {
            await super.uploadFile(dir, `${id}.reserved`, "This is a auto generated reservation file!");
        }

    }
}
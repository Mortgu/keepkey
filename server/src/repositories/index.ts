import {AddNextCloudRepository} from "./nextcloud-repository.js";
import BaseRepository from "./base-repository.js";
import {AddWebDavRepository} from "./webdav-repository.js";

export const repository = new (AddNextCloudRepository(AddWebDavRepository(BaseRepository)))();
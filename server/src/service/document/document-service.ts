import { TaskStatus, TaskTarget, TaskType } from "../../lib/prismaClient.js";
import { taskQueue, taskQueueKey } from "../../workers/task-queue.js";
import { Document, PrismaClient, Task } from "@prisma/client";
import { NextCloudSearch } from "./nextcloud-search.js";
import { WebDAVClient } from "webdav";

export default class DocumentService {
    constructor(
        private readonly search: NextCloudSearch,
        private readonly client: WebDAVClient,
        private readonly prisma: PrismaClient,
    ) {
    }

    async generateDocument(document: Document): Promise<Task> {
        const task = await this.prisma.task.create({
            data: {
                status: TaskStatus.PENDING,
                type: TaskType.UPLOAD,
                target: TaskTarget.OFFER,
            }
        });

        const job = await taskQueue.add(taskQueueKey, {
            taskId: task.id,
        });

        await this.prisma.task.update({
            where: { id: task.id },
            data: { jobId: job.id }
        });

        await this.prisma.document.update({
            where: { id: document.id },
            data: { taskId: task.id },
        });

        return task;
    }

    async uploadDocument(filename: string, upload_dir: string, content: Buffer) {
        try {
            this.client.putFileContents(`${upload_dir}/${filename}`, content, { overwrite: false });
            return `${upload_dir}/${filename}`;
        } catch (exception: any) {
            console.error(exception);
            throw new Error("Upload Failed!")
        }
    }
}
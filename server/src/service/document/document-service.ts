import UploadOrchestrator from "./upload-orchestrator.js";
import { DocumentRequest } from "./types.js";
import { TaskStatus, TaskTarget, TaskType } from "../../lib/prismaClient.js";
import { taskQueue, taskQueueKey } from "../../workers/task-queue.js";
import { Document, PrismaClient, Task } from "@prisma/client";
import { NextCloudSearch } from "./nextcloud-search.js";

export default class DocumentService {
    constructor(
        private readonly search: NextCloudSearch,
        private readonly orchestrator: UploadOrchestrator,
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

    async uploadDocument(request: DocumentRequest) {
        const { id, filename, content } = request;

        // 1. ID reservieren — wirft DuplicateDocumentError bei Kollision
        //await this.registry.reserve(id);
        const exists = this.search.findById(id, "/");

        // 2. Parallel hochladen
        const result = await this.orchestrator.upload(id, filename, content);

        // 3. Registry aktualisieren
        const successful = result.results.filter((r) => r.status !== "failed").map((r) => r.locationName);

        //await this.registry.markComplete(id, successful);

        return result;
    }
}
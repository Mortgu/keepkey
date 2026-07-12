import { Task } from "../../lib/prismaClient.js";
import { generateOfferDocument } from "../../services/document-generation.service.js";

export default async function offerTaskHandler(task: Task): Promise<void> {
    await generateOfferDocument(task.id);
}

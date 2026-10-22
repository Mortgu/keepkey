import { Task } from "@prisma/client";
import { generateInvoiceDocument } from "../../services/invoice-generation.service.js";

export default async function invoiceTaskHandler(task: Task): Promise<void> {
    await generateInvoiceDocument(task.id);
}

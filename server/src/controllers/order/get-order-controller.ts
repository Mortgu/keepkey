import { Request, Response } from "express";
import path from "path";
import fs from "fs/promises";
import { prisma } from "../../lib/prismaClient.js";


export const getAllOrders = async (request: Request, response: Response) => {
    const orders = await prisma.order.findMany({
        include: {
            customer: true,
            customerContactPerson: true,
            documents: {
                orderBy: { version: "desc" as const },
                include: {
                    pdf: true,
                    docx: true,
                    task: true,
                },
            },
            orderPositions: {
                include: {
                    product: { include: { translations: true } },
                    contract: { include: { translations: true } },
                },
            },
            flatRates: {
                include: {
                    flatRate: { include: { translations: true } },
                },
            },
        },
    });

    return response.status(200).json(orders);
};

export const getOrderById = async (request: Request, response: Response) => {
    const { orderId } = request.params;

    const order = await prisma.order.findUnique({
        where: { id: orderId as string },
        include: {
            customer: true,
            customerContactPerson: true,
            documents: {
                orderBy: { version: "desc" as const },
                include: {
                    pdf: true,
                    docx: true,
                    task: true,
                },
            },
            orderPositions: {
                include: {
                    product: { include: { translations: true } },
                    contract: { include: { translations: true } },
                },
            },
            flatRates: {
                include: {
                    flatRate: { include: { translations: true } },
                },
            },
        },
    });

    return response.status(200).json(order);
};

export const downloadOrderDocument = async (request: Request, response: Response) => {
    const orderId = request.params.orderId as string;
    const documentId = request.params.documentId as string;
    const format = (request.params.format as string).toLowerCase();

    if (format !== "pdf" && format !== "docx") {
        return response.status(400).json({message: "Invalid format. Use 'pdf' or 'docx'."});
    }

    const orderDoc = await prisma.orderDocument.findFirst({
        where: { orderId, id: documentId },
        include: { pdf: true, docx: true },
    });

    if (!orderDoc) {
        return response.status(404).json({message: "Document not found"});
    }

    if (orderDoc.status !== "GENERATED") {
        return response.status(409).json({message: "Document not yet generated"});
    }

    const file = format === "pdf" ? orderDoc.pdf : orderDoc.docx;
    if (!file) {
        return response.status(404).json({ message: "File not found" });
    }

    const filePath = path.join(file.path, file.basename);

    try {
        await fs.access(filePath);
    } catch {
        return response.status(404).json({message: "File not found on disk"});
    }

    const mimeTypes: Record<string, string> = {
        pdf: "application/pdf",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };

    const downloadName = `${orderDoc.displayName ?? orderDoc.id}.${format}`;
    response.setHeader("Content-Type", mimeTypes[format]);
    return response.download(filePath, downloadName);
};

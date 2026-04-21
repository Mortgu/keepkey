import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { generateOfferPdf } from "../utils/generation/document-generator.js";

/*
 * Get all orders
 * [GET] http://localhost:3000/api/admin/orders
 */
export const getAllOrders = async (request: Request, response: Response, next: NextFunction) => {
    const orders = await prisma.order.findMany({
        include: {
            customer: true,
            orderPositions: {
                include: {
                    product: true,
                    contract: true,
                }
            }
        }
    });

    return response.status(200).json(orders);
}

/*
 * [GET] http://localhost:3000/api/orders/:oderId
 */
export const getOrderById = async (request: Request, response: Response, next: NextFunction) => {
    const { orderId } = request.params;

    const order = await prisma.order.findUnique({
        where: { id: orderId as string },
        include: {
            customer: true,
            orderPositions: {
                include: {
                    product: true,
                    contract: true,
                }
            }
        }
    });

    generateOfferPdf({
        data: {
            companyName: "",
            customer: {
                salutation: order?.customer.salutation || '',
                firstName: order?.customer.firstName || '',
                lastName: order?.customer.lastName || '',
            },
            street: "",
            plzCity: "",
            paymentTerm: "",
            validUntil: "",
            customerId: order?.customerId || '',
            suplirId: "",
            requestDate: "",
            employee: { salutation: "", firstName: "", lastName: "" },
            order: {
                invoiceNumber: String(order?.id.slice(0, 8)),
            },
            date: String(Date.now()),
            products: "Product 1 & Product 2",
        },
        outputPath: "output.pdf",
        templatePath: "template-offer.html"
    });

    return response.status(200).json(order);
}

/*
 * Get all session orders
 * [GET] http://localhost:3000/api/orders
 */
export const getSessionOrders = async (request: Request, response: Response, next: NextFunction) => {
    const user = request.user;

    if (!user) {
        return response.status(403).json({
            success: false, message: 'Bad request',
        });
    }

    const customer = await prisma.customer.findUnique({ where: { userId: user.id } });
    if (!customer) {
        return response.status(200).json([]);
    }

    const orders = await prisma.order.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: 'desc' },
        include: {
            customer: true,
            orderPositions: {
                include: {
                    product: true,
                    contract: true,
                }
            }
        }
    });

    return response.status(200).json(orders);
}

/*
 * Create new order
 * [POST] http://localhost:3000/api/orders
 */
export const createOrder = async (request: Request, response: Response, next: NextFunction) => {
    const { body, user } = request;

    if (!body || !user || body.length === 0) {
        response.status(400).send({
            message: "Bad request", success: false
        });
    }

    if (!(body instanceof Array)) {
        return response.status(400).send({
            message: `Excepted Array got ${typeof body}`, success: false,
        });
    }

    const customer = await prisma.customer.findUnique({ where: { userId: user!.id } });
    if (!customer) {
        return response.status(400).json({ success: false, message: 'No customer linked to this account!' });
    }

    const createdOrder = await prisma.$transaction(async (tx) => {
        /* Create Order */
        const order = await tx.order.create({
            data: { customerId: customer.id },
        });

        /* Create Order Positions */
        for (const item of body) {
            await tx.orderPosition.create({
                data: {
                    orderId: order.id,
                    productId: item.productId,
                    contractId: item.contractId,
                    duration: item.duration,
                    quantity: item.quantity,
                    priceAtPurchase: item.price || 0,
                }
            });
        }

        return order;
    });

    /* Return if failed */
    if (!createdOrder) {
        return response.status(500).json({
            success: false, message: "Failed to create Order!",
        });
    }

    /* Order successfull => Generate Documents */

}

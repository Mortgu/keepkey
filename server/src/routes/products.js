import { Router } from "express";
import {prisma} from "../lib/prisma.js";
import {canCreateProduct} from "../permissions/product.js";
import {requireSession} from "../middlewares/auth.js";

const router = Router();

/* [GET] http://localhost:3000/api/products */
router.get('/', async (request, response) => {
    const result = await prisma.product.findMany({
        include: {
            productPricing: {
                include: {
                    product: true,
                    contract: true
                }
            }
        }
    });
    response.status(200).send(result);
});

/* [GET] http://localhost:3000/api/products/{id} */
router.get('/:id', async (request, response) => {
    const { id } = request.params;
    const result = await prisma.product.findUnique({
        where: { id },
        include: {
            productPricing: true
        }
    });
    response.status(200).send(result);
});

/* [POST] http://localhost:3000/api/products */
router.post('/', requireSession, canCreateProduct, async (request, response) => {
    const { body } = request;

    if (!body) {
        response.status(400).send({
            message: "Bad request", success: false
        })
    }

    const result = await prisma.product.create({
        data: {
            ...body
        },
        include: {
            productPricing: {
                include: {
                    product: true,
                    contract: true
                }
            }
        }
    })

    response.status(200).send(result);
});

/* [DELETE] http://localhost:3000/api/products/{id} */
router.delete('/:id', async (request, response) => {
    const { id } = request.params;
    const result = await prisma.product.deleteMany({
        where: { id },
    });
    response.status(200).send(result);
});

export default router;
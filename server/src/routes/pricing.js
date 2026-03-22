import { Router } from "express";
import {prisma} from "../lib/prisma.js";
import {canCreateProduct} from "../permissions/product.js";
import {requireSession} from "../middlewares/auth.js";

const router = Router();

/* [POST] http://localhost:3000/api/pricing */
router.post('/:id', requireSession, canCreateProduct, async (request, response) => {
    const { id: productId } = request.params;
    const { body } = request;

    if (!body) {
        response.status(400).send({
            message: "Bad request", success: false
        })
    }

    const result = await prisma.productPricing.create({
        data: {
            productId: productId,
            ...body
        }
    })

    response.status(200).send(result);
});

export default router;
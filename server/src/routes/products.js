import { Router } from "express";
import {prisma} from "../lib/prisma.js";
import {canCreateProduct} from "../permissions/product.js";
import {requireSession} from "../middlewares/auth.js";

const router = Router();

/* [GET] http://localhost:3000/api/products */
router.get('/', async (request, response) => {
    const result = await prisma.product.findMany();
    response.status(200).send(result);
});

/* [GET] http://localhost:3000/api/products */
router.get('/:id', async (request, response) => {
    const { id } = request.params;
    const result = await prisma.product.findUnique({
        where: { id }
    });
    response.status(200).send(result);
});

export default router;
import { Router } from "express";
import {prisma} from "../lib/prisma.js";
import {canCreateProduct} from "../permissions/product.js";
import {requireSession} from "../middlewares/auth.js";

const router = Router();

/* [GET] http://localhost:3000/api/products */
router.get('/', requireSession, canCreateProduct, async (request, response) => {
    const result = await prisma.product.findMany();
    response.send(result);
});

export default router;
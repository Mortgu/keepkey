import { Router } from "express";
import {prisma} from "../lib/prisma.js";
import {canCreateProduct} from "../permissions/product.js";
import {requireSession} from "../middlewares/auth.js";

const router = Router();

/* [GET] http://localhost:3000/api/users */
router.get('/', requireSession, async (request, response) => {
    const result = await prisma.user.findMany();
    response.status(200).send(result);
});

/* [GET] http://localhost:3000/api/users/current */
router.get('/current', requireSession, async (request, response) => {
    const user = request.user;
    const result = await prisma.user.findMany({
        where: { id: user.id },
    });
    response.status(200).send(result);
});

export default router;
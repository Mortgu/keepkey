import type { Request, Response } from "express";
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireSession } from "../middlewares/auth.js";
import { canCreateContract, canDeleteContract } from "../permissions/contract.js";

const router = Router();

/* [GET] http://localhost:3000/api/contracts */
router.get('/', async (request: Request, response: Response) => {
    const match = await prisma.contract.findMany();

    response.status(200).json(match);
});

/* [POST] http://localhost:3000/api/contracts */
router.post('/', requireSession, canCreateContract, async (request: Request, response: Response) => {
    const { body } = request;
    const user = request.user;

    if (!body) {
        return response.status(400).json({
            message: "Bad request", success: false
        });
    }

    const result = await prisma.contract.create({ data: body });

    response.status(200).json(result);
});

/* [DELETE] http://localhost:3000/api/contracts */
router.delete('/', requireSession, canDeleteContract, async (request: Request, response: Response) => {
    const { body } = request;
    const user = request.user;

    if (!body) {
        return response.status(400).json({
            message: "Bad request", success: false
        });
    }

    const result = await prisma.contract.deleteMany({
        where: { id: body.id }
    });

    response.status(200).send(result);
})

export default router;

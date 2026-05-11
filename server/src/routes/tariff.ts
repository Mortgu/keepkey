import { Request, Response, Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get('/', async (request: Request, response: Response) => {
    const tariffs = await prisma.tariff.findMany({
        include: {
            products: true,
            customers: true,
        }
    });
    return response.status(200).json(tariffs);
});

export default router;

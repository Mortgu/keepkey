import {Router} from "express";
import {prisma} from "../lib/prisma.js";
import {requireSession} from "../middlewares/auth.js";

const router = Router();

/* [GET] http://localhost:3000/api/contracts */
router.get('/', async (request, response) => {
    const match = await prisma.contract.findMany();
    response.status(200).send(match);
});

/* [POST] http://localhost:3000/api/contracts */
router.post('/', requireSession, async (request, response) => {
    const { body } = request;
    const user = request.user;

    if (!body) {
        return response.status(400).json({
            message: "Bad request", success: false
        });
    }

    const result = await prisma.contract.create({data: body});
    console.log(result)
    response.status(200).send(result);
});

/* [DELETE] http://localhost:3000/api/contracts */
router.delete('/', requireSession, async (request, response) => {
    const { body } = request;
    const user = request.user;

    if (!body) {
        return response.status(400).json({
            message: "Bad request", success: false
        });
    }

    const result = await prisma.contract.deleteMany({
        where: {id: body.id}
    });

    response.status(200).send(result);
})

export default router;
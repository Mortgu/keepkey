import { Router } from "express";

import {
    createContract,
    deleteContract,
    getAllContracts,
    getContract,
    updateContract
} from "@/controllers/index.js";
import { validate, validateParams } from "@/middlewares/zod.middleware.js";
import { idParamsSchema } from "@/schemas/params-schemas.js";
import { createContractSchema, updateContractSchema } from "@keepit/schemas";

const router = Router();

/* [GET] http://localhost:3000/api/contracts */
router.get("/", getAllContracts);

/* [GET] http://localhost:3000/api/contracts/:id */
router.get("/:id", validateParams(idParamsSchema), getContract);

/* [POST] http://localhost:3000/api/contracts */
router.post("/", validate(createContractSchema), createContract);

/* [PATCH] http://localhost:3000/api/contracts/:id */
router.patch("/:id", validateParams(idParamsSchema), validate(updateContractSchema), updateContract);

/* [DELETE] http://localhost:3000/api/contracts/:id */
router.delete("/:id", validateParams(idParamsSchema), deleteContract);

export default router;

import {Router} from "express";

import {createContract, deleteContract, getAllContracts, updateContract,} from "../controllers/index.js";

import {validate} from "../middlewares/validate.js";

import {createContractSchema, updateContractSchema,} from "../schemas/index.js";

const router = Router();

/* [GET] http://localhost:3000/api/contracts */
router.get("/", getAllContracts);

/* [POST] http://localhost:3000/api/contracts */
router.post("/", validate(createContractSchema), createContract);

/* [PUT] http://localhost:3000/api/contracts/:id */
router.put("/:id", validate(updateContractSchema), updateContract);

/* [DELETE] http://localhost:3000/api/contracts/:id */
router.delete("/:id", deleteContract);

export default router;

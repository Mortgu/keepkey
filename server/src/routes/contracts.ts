import { Router } from "express";
import { requireSession } from "../middlewares/auth.js";
import { canCreateContract, canDeleteContract, canUpdateContract } from "../permissions/contract.js";
import { createContract, deleteContract, getAllContracts, updateContract } from "../controllers/contractController.js";

const router = Router();

/* [GET] http://localhost:3000/api/contracts */
router.get('/', getAllContracts);

/* [POST] http://localhost:3000/api/contracts */
router.post('/', requireSession, canCreateContract, createContract);

/* [PUT] http://localhost:3000/api/contracts/:id */
router.put('/:id', requireSession, canUpdateContract, updateContract);

/* [DELETE] http://localhost:3000/api/contracts */
router.delete('/', requireSession, canDeleteContract, deleteContract);

export default router;

import { Router } from "express";
import {
  canCreateContract,
  canDeleteContract,
  canUpdateContract,
} from "../permissions/contract.js";
import {
  createContract,
  deleteContract,
  getAllContracts,
  updateContract,
} from "../controllers/contract-controller.js";
import { validate } from "../middlewares/validate.js";
import {
  createContractSchema,
  updateContractSchema,
} from "../schemas/index.js";

const router = Router();

/* [GET] http://localhost:3000/api/contracts */
router.get("/", getAllContracts);

/* [POST] http://localhost:3000/api/contracts */
router.post(
  "/",
  canCreateContract,
  validate(createContractSchema),
  createContract,
);

/* [PUT] http://localhost:3000/api/contracts/:id */
router.put(
  "/:id",
  canUpdateContract,
  validate(updateContractSchema),
  updateContract,
);

/* [DELETE] http://localhost:3000/api/contracts/:id */
router.delete("/:id", canDeleteContract, deleteContract);

export default router;

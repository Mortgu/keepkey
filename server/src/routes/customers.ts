import { Router } from "express";
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomerById,
  deleteCustomer,
} from "../controllers/customer-controller.js";
import { validate } from "../middlewares/validate.js";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../schemas/index.js";

const router = Router();

/* [GET] http://localhost:3000/api/customers */
router.get("/", getAllCustomers);

/* [GET] http://localhost:3000/api/customers/:id */
router.get("/:id", getCustomerById);

/* [POST] http://localhost:3000/api/customers */
router.post("/", validate(createCustomerSchema), createCustomer);

/* [POST] http://localhost:3000/api/customers/:id */
router.post("/:id", validate(updateCustomerSchema), updateCustomerById);

/* [DELETE] http://localhost:3000/api/customers/:id */
router.delete("/:id", deleteCustomer);

export default router;

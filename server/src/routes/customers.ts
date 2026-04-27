import { Router } from "express";
import { requireSession } from "../middlewares/auth.js";
import { getAllCustomers, getCustomerById, createCustomer, updateCustomerById, deleteCustomer } from "../controllers/customer-controller.js";
import { validate } from "../middlewares/validate.js";
import { createCustomerSchema, updateCustomerSchema } from "../schemas/index.js";

const router = Router();

/* [GET] http://localhost:3000/api/customers */
router.get('/', requireSession, getAllCustomers);

/* [GET] http://localhost:3000/api/customers/:id */
router.get('/:id', requireSession, getCustomerById);

/* [POST] http://localhost:3000/api/customers */
router.post('/', requireSession, validate(createCustomerSchema), createCustomer);

/* [POST] http://localhost:3000/api/customers/:id */
router.post('/:id', requireSession, validate(updateCustomerSchema), updateCustomerById);

/* [DELETE] http://localhost:3000/api/customers/:id */
router.delete('/:id', requireSession, deleteCustomer);

export default router;

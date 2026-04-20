import { Router } from "express";
import { requireSession } from "../middlewares/auth.js";
import { getAllCustomers, getCustomerById, createCustomer, updateCustomerById, deleteCustomer } from "../controllers/customerController.js";

const router = Router();

/* [GET] http://localhost:3000/api/customers */
router.get('/', requireSession, getAllCustomers);

/* [GET] http://localhost:3000/api/customers/:id */
router.get('/:id', requireSession, getCustomerById);

/* [POST] http://localhost:3000/api/customers */
router.post('/', requireSession, createCustomer);

/* [POST] http://localhost:3000/api/customers/:id */
router.post('/:id', requireSession, updateCustomerById);

/* [DELETE] http://localhost:3000/api/customers/:id */
router.delete('/:id', requireSession, deleteCustomer);

export default router;

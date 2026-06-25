import { Router } from "express";
import { createCustomer, createCustomerContact, deleteCustomer, deleteCustomerContact, getCustomer, getCustomerContacts, getCustomers, updateCustomer, updateCustomerContact } from "../controllers/index.js";
import { validate } from "../middlewares/validate.js";
import { createCustomerContactSchema, createCustomerSchema, updateCustomerContactSchema, updateCustomerSchema } from "../schemas/customer-schemas.js";
import { router } from "better-auth/api";

const router = Router();

/* ========== Customer ========== */

/* [GET] /api/customers */
router.get('/', getCustomers);

/* [GET] /api/customers/:id */
router.get('/', getCustomer);

/* [POST] /api/customers */
router.post('/', validate(createCustomerSchema), createCustomer);

/* [PATCH] /api/customers/:id */
router.patch('/:id', validate(updateCustomerSchema), updateCustomer);

/* [DELETE] /api/customers/:id */
router.delete('/:id', deleteCustomer);

/* ========== Customer Contacts ========== */

/* [GET] /api/customers/:id/contacts */
router.get('/:id/contacts', getCustomerContacts);

/* [POST] /api/customers/:id/contacts */
router.post('/:id/contacts', validate(createCustomerContactSchema), createCustomerContact);

/* [PATCH] /api/customers/:id/contacts/:contactId */
router.patch('/:id/contacts/:contactId', validate(updateCustomerContactSchema), updateCustomerContact);

/* [DELETE] /api/customers/:id/contacts/:contactId */
router.delete('/:id/contacts/:contactId', deleteCustomerContact);

export default router;
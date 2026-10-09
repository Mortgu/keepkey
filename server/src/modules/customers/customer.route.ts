import { Router } from "express";
import { createCustomer, createCustomerContact, deleteCustomer, deleteCustomerContact, getCustomer, getCustomerContacts, getCustomers, updateCustomer, updateCustomerContact } from "./customer.controller.js";
import { validate, validateParams, validateQuery } from "@/core/middleware/zod.middleware.js";
import { idParamsSchema, customerContactParamsSchema } from "@/core/params.schemas.js";
import {
    createContactSchema,
    updateContactSchema,
    createCustomerSchema,
    updateCustomerSchema,
    customerFiltersSchema
} from "@keepit/schemas";

const router = Router();

/* ========== Customer ========== */

/* [GET] /api/customers */
router.get('/', validateQuery(customerFiltersSchema), getCustomers);

/* [GET] /api/customers/:id */
router.get('/:id', validateParams(idParamsSchema), getCustomer);

/* [POST] /api/customers */
router.post('/', validate(createCustomerSchema), createCustomer);

/* [PATCH] /api/customers/:id */
router.patch('/:id', validateParams(idParamsSchema), validate(updateCustomerSchema), updateCustomer);

/* [DELETE] /api/customers/:id */
router.delete('/:id', validateParams(idParamsSchema), deleteCustomer);

/* ========== Customer Contacts ========== */

/* [GET] /api/customers/:id/contacts */
router.get('/:id/contacts', validateParams(idParamsSchema), getCustomerContacts);

/* [POST] /api/customers/:id/contacts */
router.post('/:id/contacts', validateParams(idParamsSchema), validate(createContactSchema), createCustomerContact);

/* [PATCH] /api/customers/:id/contacts/:contactId */
router.patch('/:id/contacts/:contactId', validateParams(customerContactParamsSchema), validate(updateContactSchema), updateCustomerContact);

/* [DELETE] /api/customers/:id/contacts/:contactId */
router.delete('/:id/contacts/:contactId', validateParams(customerContactParamsSchema), deleteCustomerContact);

export default router;
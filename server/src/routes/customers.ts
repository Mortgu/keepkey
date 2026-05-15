import { Router } from "express";
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomerById,
  deleteCustomer,
  getAllCustomerContacts,
  updateContact,
  deleteContactById,
  createContact,
} from "../controllers/customer-controller.js";
import { validate } from "../middlewares/validate.js";
import {
  createContactSchema,
  createCustomerSchema,
  updateContactSchema,
  updateCustomerSchema,
} from "../schemas/index.js";

const router = Router();

/* [GET] /api/customers */
router.get("/", getAllCustomers);

/* [GET] /api/customers/:id */
router.get("/:id", getCustomerById);

/* [GET] /api/customers/:id/contacts */
router.get('/:id/contacts', getAllCustomerContacts);

/* [POST] /api/customers */
router.post("/", validate(createCustomerSchema), createCustomer);

/* [POST] /api/customers/contacts */
router.post('/contacts', validate(createContactSchema), createContact);

/* [PATCH] /api/customers/:id */
router.patch("/:id", validate(updateCustomerSchema), updateCustomerById);

/* [PATCH] /api/customers/contacts/:cid */
router.patch('/contacts/:cid', validate(updateContactSchema), updateContact);

/* [DELETE] /api/customers/:id */
router.delete("/:id", deleteCustomer);

/* [DELETE] /api/customers/contacts/:cid */
router.delete('/contacts/:cid', deleteContactById);

export default router;

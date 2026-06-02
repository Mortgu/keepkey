import { Router } from "express";
import {
    addTariffConfig,
    addTariffCustomer,
    createTariff,
    deleteTariff,
    deleteTariffConfig,
    deleteTariffCustomer,
    getAllTariffs,
    getTariffById,
    getTariffPrice,
    updateTariff,
    updateTariffConfig,
    updateTariffCustomer,
} from "../controllers/tariff-controller.js";
import { validate } from "../middlewares/validate.js";
import {
    createTariffConfigSchema,
    createTariffCustomerSchema,
    createTariffSchema,
    updateTariffConfigSchema,
    updateTariffCustomerSchema,
    updateTariffSchema,
} from "../schemas/tariffs-schemas.js";

const router = Router();

router.get("/", getAllTariffs);
router.get("/price", getTariffPrice);
router.get("/:id", getTariffById);
router.post("/", validate(createTariffSchema), createTariff);
router.put("/:id", validate(updateTariffSchema), updateTariff);
router.delete("/:id", deleteTariff);

router.post("/:id/configs", validate(createTariffConfigSchema), addTariffConfig);
router.put(
    "/:id/configs/:configId",
    validate(updateTariffConfigSchema),
    updateTariffConfig,
);
router.delete("/:id/configs/:configId", deleteTariffConfig);

router.post(
    "/:id/customers",
    validate(createTariffCustomerSchema),
    addTariffCustomer,
);
router.put(
    "/:id/customers/:tariffCustomerId",
    validate(updateTariffCustomerSchema),
    updateTariffCustomer,
);
router.delete("/:id/customers/:tariffCustomerId", deleteTariffCustomer);

export default router;

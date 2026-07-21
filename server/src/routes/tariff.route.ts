import { Router } from "express";
import {
    createTariff,
    createTariffColumn,
    createTariffGroup,
    createTariffRow,
    deleteCustomerPrice,
    deleteTariff,
    deleteTariffColumn,
    deleteTariffGroup,
    deleteTariffRow,
    getTariff,
    getTariffDurations,
    getTariffGroup,
    getTariffGroups,
    getTariffHistory,
    getTariffPrice,
    updateTariffCell,
    updateTariffColumn,
    updateTariffGroup,
    updateTariffRow,
    upsertCustomerPrice
} from "@/controllers/index.js";
import { validate } from "@/middlewares/zod.middleware.js";
import {
    createTariffColumnSchema,
    createTariffGroupSchema,
    createTariffRowSchema,
    createTariffSchema,
    updateTariffCellSchema,
    updateTariffColumnSchema,
    updateTariffGroupSchema,
    updateTariffRowSchema,
    upsertCustomerPriceSchema,
} from "@/schemas/index.js";

const router = Router();

/* [GET] /api/tariffs — alle TariffGroups */
router.get('/', getTariffGroups);

/* [POST] /api/tariffs — neue TariffGroup */
router.post('/', validate(createTariffGroupSchema), createTariffGroup);

/* [GET] /api/tariffs/price */
router.get("/price", getTariffPrice);

/* [PUT] /api/tariffs/customer-price — kundenspezifischen Stückpreis upserten */
router.put("/customer-price", validate(upsertCustomerPriceSchema), upsertCustomerPrice);

/* [DELETE] /api/tariffs/customer-price — kundenspezifischen Stückpreis entfernen */
router.delete("/customer-price", deleteCustomerPrice);

/* [GET] /api/tariffs/history/:productId/:contractId */
router.get('/history/:productId/:contractId', getTariffHistory);

/* [GET] /api/tariffs/durations/:productId/:contractId */
router.get('/durations/:productId/:contractId', getTariffDurations);

/* [GET] /api/tariffs/:id — eine TariffGroup */
router.get('/:id', getTariffGroup);

/* [PATCH] /api/tariffs/:id — TariffGroup aktualisieren */
router.patch('/:id', validate(updateTariffGroupSchema), updateTariffGroup);

/* [DELETE] /api/tariffs/:id — TariffGroup löschen */
router.delete('/:id', deleteTariffGroup);

/* [POST] /api/tariffs/:id/tariffs — Tariff in Gruppe erstellen */
router.post('/:id/tariffs', validate(createTariffSchema), createTariff);

/* [GET] /api/tariffs/:id/:tariffId — einzelner Tariff */
router.get('/:id/:tariffId', getTariff);

/* [DELETE] /api/tariffs/:id/:tariffId — Tariff löschen */
router.delete('/:id/:tariffId', deleteTariff);

/* [POST] /api/tariffs/:id/:tariffId/column */
router.post('/:id/:tariffId/column', validate(createTariffColumnSchema), createTariffColumn);

/* [DELETE] /api/tariffs/:id/:tariffId/column/:columnId */
router.delete('/:id/:tariffId/column/:columnId', deleteTariffColumn);

/* [PATCH] /api/tariffs/:id/:tariffId/column/:columnId */
router.patch('/:id/:tariffId/column/:columnId', validate(updateTariffColumnSchema), updateTariffColumn);

/* [POST] /api/tariffs/:id/:tariffId/row */
router.post('/:id/:tariffId/row', validate(createTariffRowSchema), createTariffRow);

/* [DELETE] /api/tariffs/:id/:tariffId/row/:rowId */
router.delete('/:id/:tariffId/row/:rowId', deleteTariffRow);

/* [PATCH] /api/tariffs/:id/:tariffId/row/:rowId */
router.patch('/:id/:tariffId/row/:rowId', validate(updateTariffRowSchema), updateTariffRow);

/* [PATCH] /api/tariffs/:id/:tariffId/cell/:cellId */
router.patch('/:id/:tariffId/cell/:cellId', validate(updateTariffCellSchema), updateTariffCell);

export default router;

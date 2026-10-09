import { Router } from "express";
import { createStandardDuration, createStandardTier, createTariff, createTariffGroup, deleteCustomerPrice, deleteCustomerPriceById, deleteStandardDuration, deleteStandardTier, deleteTariff, deleteTariffCell, deleteTariffGroup, getCustomerPrices, getStandardDurations, getStandardTiers, getTariff, getTariffGroup, getTariffGroups, getTariffPrice, getTariffVersions, restoreTariffVersion, sealTariffVersion, updateStandardTier, updateTariffCell, updateTariffGroup, upsertCustomerPrice } from "./tariff.controller.js";
import { validate, validateParams, validateQuery } from "@/core/middleware/zod.middleware.js";
import {
    idParamsSchema,
    tariffParamsSchema,
    tariffVersionParamsSchema,
} from "@/core/params.schemas.js";
import {
    createStandardDurationSchema,
    createStandardTierSchema,
    createTariffGroupSchema,
    createTariffSchema,
    deleteCustomerPriceSchema,
    listCustomerPricesSchema,
    deleteTariffCellSchema,
    updateStandardTierSchema,
    updateTariffCellSchema,
    updateTariffGroupSchema,
    tariffPriceQuerySchema,
    upsertCustomerPriceSchema,
} from "@keepit/schemas";

const router = Router();

/* [GET] /api/tariffs — alle TariffGroups */
router.get('/', getTariffGroups);

/* [POST] /api/tariffs — neue TariffGroup */
router.post('/', validate(createTariffGroupSchema), createTariffGroup);

/* [GET] /api/tariffs/price */
router.get("/price", validateQuery(tariffPriceQuerySchema), getTariffPrice);

/* [PUT] /api/tariffs/customer-price — kundenspezifischen Stückpreis upserten */
router.put("/customer-price", validate(upsertCustomerPriceSchema), upsertCustomerPrice);

/* [DELETE] /api/tariffs/customer-price — kundenspezifischen Stückpreis entfernen */
router.delete("/customer-price", validateQuery(deleteCustomerPriceSchema), deleteCustomerPrice);

/* [GET] /api/tariffs/customer-prices?customerId= — alle Preise eines Kunden */
router.get("/customer-prices", validateQuery(listCustomerPricesSchema), getCustomerPrices);

/* [DELETE] /api/tariffs/customer-prices/:id — über die Id, damit auch eine
   Mengenstufe erreichbar bleibt, die keine Menge mehr trifft */
router.delete("/customer-prices/:id", validateParams(idParamsSchema), deleteCustomerPriceById);

/* [GET] /api/tariffs/standard-durations — global gepflegte Laufzeiten */
router.get('/standard-durations', getStandardDurations);

/* [POST] /api/tariffs/standard-durations */
router.post('/standard-durations', validate(createStandardDurationSchema), createStandardDuration);

/* [DELETE] /api/tariffs/standard-durations/:id */
router.delete('/standard-durations/:id', validateParams(idParamsSchema), deleteStandardDuration);

/* [GET] /api/tariffs/standard-tiers — global gepflegte Mengenstaffeln */
router.get('/standard-tiers', getStandardTiers);

/* [POST] /api/tariffs/standard-tiers */
router.post('/standard-tiers', validate(createStandardTierSchema), createStandardTier);

/* [PATCH] /api/tariffs/standard-tiers/:id */
router.patch('/standard-tiers/:id', validateParams(idParamsSchema), validate(updateStandardTierSchema), updateStandardTier);

/* [DELETE] /api/tariffs/standard-tiers/:id */
router.delete('/standard-tiers/:id', validateParams(idParamsSchema), deleteStandardTier);

/* [GET] /api/tariffs/:id — eine TariffGroup */
router.get('/:id', validateParams(idParamsSchema), getTariffGroup);

/* [PATCH] /api/tariffs/:id — TariffGroup aktualisieren */
router.patch('/:id', validateParams(idParamsSchema), validate(updateTariffGroupSchema), updateTariffGroup);

/* [DELETE] /api/tariffs/:id — TariffGroup löschen */
router.delete('/:id', validateParams(idParamsSchema), deleteTariffGroup);

/* [POST] /api/tariffs/:id/tariffs — Tariff in Gruppe erstellen */
router.post('/:id/tariffs', validateParams(idParamsSchema), validate(createTariffSchema), createTariff);

/* [GET] /api/tariffs/:id/:tariffId — einzelner Tariff */
router.get('/:id/:tariffId', validateParams(tariffParamsSchema), getTariff);

/* [DELETE] /api/tariffs/:id/:tariffId — Tariff löschen */
router.delete('/:id/:tariffId', validateParams(tariffParamsSchema), deleteTariff);

/* [GET] /api/tariffs/:id/:tariffId/versions — Versionshistorie */
router.get('/:id/:tariffId/versions', validateParams(tariffParamsSchema), getTariffVersions);

/* [POST] /api/tariffs/:id/:tariffId/versions — aktuellen Stand versiegeln */
router.post('/:id/:tariffId/versions', validateParams(tariffParamsSchema), sealTariffVersion);

/* [POST] /api/tariffs/:id/:tariffId/versions/:versionId/restore */
router.post('/:id/:tariffId/versions/:versionId/restore', validateParams(tariffVersionParamsSchema), restoreTariffVersion);

/* [PATCH] /api/tariffs/:id/:tariffId/cell — Preis an einer Koordinate setzen */
router.patch('/:id/:tariffId/cell', validateParams(tariffParamsSchema), validate(updateTariffCellSchema), updateTariffCell);

/* [DELETE] /api/tariffs/:id/:tariffId/cell — Preis(e) an einer Koordinate entfernen.
   Ohne `duration` fällt die ganze Mengenstufe dieses Tarifs weg. */
router.delete('/:id/:tariffId/cell', validateParams(tariffParamsSchema), validateQuery(deleteTariffCellSchema), deleteTariffCell);

export default router;

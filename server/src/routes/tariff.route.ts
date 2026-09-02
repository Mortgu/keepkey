import { Router } from "express";
import {
    createStandardDuration,
    createStandardTier,
    createTariff,
    createTariffGroup,
    deleteCustomerPrice,
    deleteStandardDuration,
    deleteStandardTier,
    deleteTariff,
    deleteTariffCell,
    deleteTariffGroup,
    getStandardDurations,
    getStandardTiers,
    getTariff,
    getTariffGroup,
    getTariffGroups,
    getTariffPrice,
    getTariffVersions,
    restoreTariffVersion,
    sealTariffVersion,
    updateStandardTier,
    updateTariffCell,
    updateTariffGroup,
    upsertCustomerPrice
} from "@/controllers/index.js";
import { validate, validateQuery } from "@/middlewares/zod.middleware.js";
import {
    createStandardDurationSchema,
    createStandardTierSchema,
    createTariffGroupSchema,
    createTariffSchema,
    deleteCustomerPriceSchema,
    deleteTariffCellSchema,
    updateStandardTierSchema,
    updateTariffCellSchema,
    updateTariffGroupSchema,
    upsertCustomerPriceSchema,
} from "@keepit/schemas";

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
router.delete("/customer-price", validateQuery(deleteCustomerPriceSchema), deleteCustomerPrice);

/* [GET] /api/tariffs/standard-durations — global gepflegte Laufzeiten */
router.get('/standard-durations', getStandardDurations);

/* [POST] /api/tariffs/standard-durations */
router.post('/standard-durations', validate(createStandardDurationSchema), createStandardDuration);

/* [DELETE] /api/tariffs/standard-durations/:id */
router.delete('/standard-durations/:id', deleteStandardDuration);

/* [GET] /api/tariffs/standard-tiers — global gepflegte Mengenstaffeln */
router.get('/standard-tiers', getStandardTiers);

/* [POST] /api/tariffs/standard-tiers */
router.post('/standard-tiers', validate(createStandardTierSchema), createStandardTier);

/* [PATCH] /api/tariffs/standard-tiers/:id */
router.patch('/standard-tiers/:id', validate(updateStandardTierSchema), updateStandardTier);

/* [DELETE] /api/tariffs/standard-tiers/:id */
router.delete('/standard-tiers/:id', deleteStandardTier);

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

/* [GET] /api/tariffs/:id/:tariffId/versions — Versionshistorie */
router.get('/:id/:tariffId/versions', getTariffVersions);

/* [POST] /api/tariffs/:id/:tariffId/versions — aktuellen Stand versiegeln */
router.post('/:id/:tariffId/versions', sealTariffVersion);

/* [POST] /api/tariffs/:id/:tariffId/versions/:versionId/restore */
router.post('/:id/:tariffId/versions/:versionId/restore', restoreTariffVersion);

/* [PATCH] /api/tariffs/:id/:tariffId/cell — Preis an einer Koordinate setzen */
router.patch('/:id/:tariffId/cell', validate(updateTariffCellSchema), updateTariffCell);

/* [DELETE] /api/tariffs/:id/:tariffId/cell — Preis(e) an einer Koordinate entfernen.
   Ohne `duration` fällt die ganze Mengenstufe dieses Tarifs weg. */
router.delete('/:id/:tariffId/cell', validateQuery(deleteTariffCellSchema), deleteTariffCell);

export default router;

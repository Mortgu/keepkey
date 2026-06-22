import {Router} from "express";
import {
    createTariff,
    createTariffColumn,
    createTariffRow,
    deleteTariffColumn,
    deleteTariffRow,
    getProductTariffs,
    getTariffById,
    getTariffDurations,
    getTariffHistory,
    getTariffPrice,
    getTariffs,
    updateTariffCell,
    updateTariffColumn,
    updateTariffRow,
} from "../controllers/index.js";
import {
    createTariffColumnSchema,
    createTariffRowSchema,
    createTariffSchema,
    updateTariffCellSchema,
    updateTariffColumnSchema,
    updateTariffRowSchema
} from "../schemas/index.js";
import {validate} from "../middlewares/validate.js";

const router = Router();

/* [GET] /api/tariffs */
router.get('/', getTariffs);

/* [GET] /api/tariffs/tariff/:tariffId */
router.get('/tariff/:tariffId', getTariffById);

/* [GET] /api/tariffs/history/:productId/:contractId */
router.get('/history/:productId/:contractId', getTariffHistory);

/* [GET] /api/tariffs/durations/:productId/:contractId */
router.get('/durations/:productId/:contractId', getTariffDurations);

/* [GET] /api/tariffs/:productId */
router.get('/:productId', getProductTariffs);

/* [GET] /api/tariffs?productId=...&contractId=...&... */
router.get("/price", getTariffPrice);

/* [POST] /api/tariffs */
router.post('/', validate(createTariffSchema), createTariff);

/* [POST] /api/tariffs/:tariffId/column   */
router.post('/:tariffId/column', validate(createTariffColumnSchema), createTariffColumn);

/* [DELETE] /api/tariffs/:tariffId/column/:columnId   */
router.delete('/:tariffId/column/:columnId', deleteTariffColumn);

/* [PATCH] /api/tariffs/:tariffId/column/:columnId */
router.patch('/:tariffId/column/:columnId', validate(updateTariffColumnSchema), updateTariffColumn)

/* [POST] /api/tariffs/:tariffId/row */
router.post('/:tariffId/row', validate(createTariffRowSchema), createTariffRow);

/* [DELETE] /api/tariffs/:tariffId/row/:rowId */
router.delete('/:tariffId/row/:rowId', deleteTariffRow);

/* [PATCH] /api/tariffs/:tariffId/row */
router.patch('/:tariffId/row/:rowId', validate(updateTariffRowSchema), updateTariffRow);

/* [PATCH] /api/tariffs/:tariffId/cell/:cellId */
router.patch('/:tariffId/cell/:cellId', validate(updateTariffCellSchema), updateTariffCell);

export default router;

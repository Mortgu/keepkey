import {Router} from "express";
import {
    addBand,
    addTerm,
    createTariff,
    deleteTariff,
    getAllTariffs,
    getProductTariffs,
    getTariff,
    getTariffPrice,
    removeBand,
    removeTerm,
    updateCell,
    updateCustomerPrice,
    updateTerm
} from "../controllers/tariff-controller.js";
import {createTariffSchema} from "../schemas/index.js";
import {validate} from "../middlewares/validate.js";

const router = Router();

/* [GET]    /api/tariffs                    */
router.get('/', getAllTariffs);

/* [POST] /api/tariffs */
router.post('/', validate(createTariffSchema), createTariff);

router.get("/price", getTariffPrice);

/* [GET]    /api/tariffs/tariff/:tariffId   */
router.get('/tariff/:tariffId', getTariff);

/* [GET]    /api/tariffs/:productId         */
router.get('/:productId', getProductTariffs);

/* [POST] /api/tariffs/:tariffId/terms   */
router.post('/:tariffId/terms', addTerm);

/* [PUT]  /api/tariffs/:tariffId/terms   */
router.put('/:tariffId/terms', removeTerm);

/* [PUT]  /api/tariffs/:tariffId/terms   */
router.patch('/:tariffId/terms', updateTerm);

/* [POST] /api/tariffs/:tariffId/bands   */
router.post('/:tariffId/bands', addBand);

/* [DELETE] /api/tariffs/:tariffId */
router.delete('/:tariffId', deleteTariff);

/* [DELETE] /api/tariffs/bands/:rowId    */
router.delete('/bands/:rowId', removeBand);

/* [PUT]  /api/tariffs/cells/:cellId     */
router.put('/cells/:cellId', updateCell);

/* [PUT]  /api/tariffs/cells/:cellId/customer-price */
router.put('/cells/:cellId/customer-price', updateCustomerPrice);

export default router;

import {Router} from "express";
import {
    addBand,
    addTerm,
    getAllTariffs,
    getProductTariffs,
    getTariff,
    getTariffPrice,
    removeBand,
    removeTerm,
    updateCell
} from "../controllers/tariff-controller.js";

const router = Router();

/* [GET]    /api/tariffs                    */
router.get('/', getAllTariffs);

router.get("/price", getTariffPrice);

/* [GET]    /api/tariffs/tariff/:tariffId   */
router.get('/tariff/:tariffId', getTariff);

/* [GET]    /api/tariffs/:productId         */
router.get('/:productId', getProductTariffs);

/* [POST] /api/tariffs/:tariffId/terms   */
router.post('/:tariffId/terms', addTerm);

/* [PUT]  /api/tariffs/:tariffId/terms   */
router.put('/:tariffId/terms', removeTerm);

/* [POST] /api/tariffs/:tariffId/bands   */
router.post('/:tariffId/bands', addBand);

/* [DELETE] /api/tariffs/bands/:rowId    */
router.delete('/bands/:rowId', removeBand);

/* [PUT]  /api/tariffs/cells/:cellId     */
router.put('/cells/:cellId', updateCell);

export default router;

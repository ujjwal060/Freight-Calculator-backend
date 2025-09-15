import express from 'express';
import { addFreightRate, deleteFreightRate, getAllFreightRates, updateFreightRate }from "../../controllers/adminController/freightRateController.js";
import { authenticateUser }from "../../middlewares/adminAuthMiddleware.js";

const router = express.Router();

router.post('/add', authenticateUser, addFreightRate);
router.put('/update/:id', authenticateUser, updateFreightRate);
router.delete('/delete/:id', authenticateUser, deleteFreightRate);
router.post('/list', authenticateUser, getAllFreightRates);

export default router;
import exprees from 'express';
import { addFreightRate, deleteFreightRate, getAllFreightRates, updateFreightRate } from '../../controllers/adminControllers/freightRateController.js';
import { verifyAdmin } from '../../middlewares/authMiddleware.js';

const router = exprees.Router();

router.post('/add', verifyAdmin, addFreightRate);
router.put('/update/:id', verifyAdmin, updateFreightRate);
router.delete('/delete/:id', verifyAdmin, deleteFreightRate);
router.post('/list', verifyAdmin, getAllFreightRates);

export default router;
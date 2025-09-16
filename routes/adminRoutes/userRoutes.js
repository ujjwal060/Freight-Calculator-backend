import express from 'express';
import {
    getAllUsers,
} from '../../controllers/adminController/userController.js';
import { authenticateUser }from "../../middlewares/adminAuthMiddleware.js";


const router = express.Router();

router.post('/get-all-users', authenticateUser, getAllUsers);

export default router;
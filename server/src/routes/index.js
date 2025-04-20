import { Router } from "express";
import recordRoutes from "./recordRoutes.js";
import userRoutes from "./userRoutes.js";
//import transactionRoutes from "./transactionRoutes.js";

const router = Router()

router.use('/user', userRoutes);
router.use('/records', recordRoutes);
//router.use('/transactions');

export {router};

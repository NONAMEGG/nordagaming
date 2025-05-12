import { Router } from "express";
import recordRoutes from "./recordRoutes.js";
import userRoutes from "./userRoutes.js";
import bonusRoutes from "./bonusRoutes.js";
//import transactionRoutes from "./transactionRoutes.js";

const router = Router()

router.use('/user', userRoutes);
router.use('/records', recordRoutes);
router.use('/bonus', bonusRoutes);

export {router};

import { Router } from "express";
import TransactionController from "../controllers/TransactionController.js";

const router = Router()

router.get('/:user_id', TransactionController.getUserTransactions)

export default router;

import { Router } from "express";
import BonusController from "../controllers/BonusController.js";

const router = Router()

router.get('/validate', BonusController.bonusValidate);
router.put('/update', BonusController.bonusAdd);

export default router;

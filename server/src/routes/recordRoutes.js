import { Router } from "express";
import RecordController from "../controllers/RecordController.js";

const router = Router()

router.get('/', RecordController.getRecords);
router.get('/:user_id', RecordController.getRecord);
router.put('/:user_id', RecordController.addRecord);


export default router;

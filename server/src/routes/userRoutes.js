import { Router } from "express";
import UserController from "../controllers/UserController.js";
import { body } from "express-validator";

const router = Router()

router.post(
  '/registr',
  body('email').isEmail(),
  body('password').isLength({min: 3, max: 32}),
  UserController.registration
);
router.post(
  '/login',
  body('email').isEmail(),
  body('password').isLength({min: 3, max: 32}),
  UserController.login
);



export default router;

import { Router } from "express";
import UserController from "../controllers/UserController.js";
import { body } from "express-validator";
import multer from "multer"
const upload = multer({ dest: 'uploads/' })

const router = Router()

router.post(
  '/registr',
  upload.single('avatar'),
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
router.post(
  '/update',
  UserController.update
)


export default router;

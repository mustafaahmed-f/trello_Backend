import { Router } from "express";
import * as authController from './controller/auth.controller.js'
import * as validators from './validation.js'
import {validation} from '../../middleWares/validation.js'
const router = Router();


router.post("/signUp",validation(validators.signUp), authController.signUp)
router.post("/logIn" ,validation(validators.logIn), authController.logIn)
router.get("/confirmEmail/:token",validation(validators.confirmEmail) , authController.confirmEmail)
router.get("/requestNewConfirmEmail/:token",validation(validators.requestNewConfirmEmail),authController.requestNewConfirmEmail)
router.post("/forgotPass" ,validation(validators.forgotPass), authController.forgotPassword)
router.post("/newPassword/:token",validation(validators.newPassword),authController.setNewPassword)
router.get("/unsubscribeUser/:token",validation(validators.unsubscribeUser),authController.unsubscribeUser)

export default router
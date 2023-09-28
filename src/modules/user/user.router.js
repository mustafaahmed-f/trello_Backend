import Router from 'express'
import * as userController from './userController/user.controller.js'
import {auth} from '../../middleWares/authentication.js'
import { fileTypeValidation, uploadFile } from '../../utils/multer.cloud.js'
import { validation } from '../../middleWares/validation.js'
import * as validators from './validation.js'
import { checkAvailability } from '../../middleWares/checkUserAvailability.js'
 
const router = Router()

router.get('/getUser' , validation(validators.getUser) , auth , checkAvailability , userController.getUser)
router.post('/changePassword' , validation(validators.changePassword) , auth , checkAvailability , userController.changePassword)
router.put('/updateUser' , validation(validators.updateUser) , auth , checkAvailability , userController.updateUser)
router.delete('/deleteUser', validation(validators.deleteUser)  , auth, checkAvailability , userController.deleteUser)
router.delete('/softDelete' , validation(validators.softDelete) , auth, checkAvailability , userController.softDelete)
router.put('/logOut', validation(validators.logOut),auth, checkAvailability ,userController.logout)

router.patch('/profile/image' , auth ,checkAvailability , uploadFile(fileTypeValidation.image).single("img") , userController.profilePicture)
router.patch('/profile/coverImg' , auth , checkAvailability , uploadFile(fileTypeValidation.image).array("images",5),userController.coverImages)

router.delete('/deleteProfilePicture' , auth , checkAvailability , userController.deleteProfilePicture)
router.delete('/deleteCoverImages' , auth , checkAvailability , userController.deleteCoverImages)


export default router
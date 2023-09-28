import Router from 'express'
const router = Router()
import * as tasksController from './tasksController/tasks.controller.js'
import * as validators from './validation.js'
import {auth} from '../../middleWares/authentication.js'
import {validation} from '../../middleWares/validation.js'
import { checkAvailability } from '../../middleWares/checkUserAvailability.js'
import { uploadFile } from '../../utils/multer.cloud.js'



router.post('/addTask',validation(validators.addTask),auth, checkAvailability,tasksController.addTask)
router.put('/updateTask',validation(validators.updateTask),auth, checkAvailability,tasksController.updateTask)
router.delete('/deleteTask',validation(validators.deleteTask),auth, checkAvailability,tasksController.deleteTask)
router.delete('/removeListOfTasks',tasksController.removeListOfTasks)
router.get('/getTasksWithUsers',tasksController.getAllTasksWithUser)
router.get('/getTasksOfOneUser',validation(validators.getTasksOfOneUser),auth, checkAvailability ,tasksController.getTasksOfOneUser)
router.get('/tasksAfterDeadline',tasksController.tasksAfterDeadline)
router.get('/tasksOfaUser/:_id',tasksController.getTasksOfaUser)
router.patch('/updateStatus')

router.patch('/attachment',auth, checkAvailability ,uploadFile().array("attachments" , 5), tasksController.uploadAttachment)


export default router
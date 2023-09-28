import connection from "../DB/connection.js"
import authRouter from "./modules/authModule/auth.router.js"
import userRouter from './modules/user/user.router.js'
import tasksRouter from './modules/tasks/tasks.router.js'
import {globalErrorHandler} from './utils/errorHandling.js'

const bootstrap = (app,express)=>{

    app.use(express.json())
    app.use('/auth',authRouter)
    app.use('/user',userRouter)
    app.use('/tasks',tasksRouter)
    app.use('*',(req,res)=>{res.json({message:"In-valid routing .. "})})

    connection();


    app.use(globalErrorHandler)
}

export default bootstrap
import express from 'express'
import dotenv from 'dotenv'
dotenv.config()

import bootstrap from './src/index.router.js';
import { deleteNonConfirmedUsers } from './src/utils/cronJob.js';



const app = express()
const port = 5000;

app.use('/uploads/user/cover' , express.static('./uploads/user/cover'))

deleteNonConfirmedUsers()

app.listen(port,()=>{console.log(`Server is connected on port .... ${port}`);})
bootstrap(app,express);




import { Schema, Types, model } from 'mongoose'


const tasksSchema = new Schema({
    title:{type:String,required:true},
    description:{type:String,required:true},
    status:{type:String,required:true,enum:['toDo','doing','done'],default:'toDo'},
    userID:{type:Types.ObjectId , ref:'user'},
    assignTo:{type:Types.ObjectId , ref:'user'},
    deadline:{type:Date , required:true},
    attachments:[{secure_url:String,public_id:String}]
    
},{timestamps:true})

const tasksModel = model('task',tasksSchema)

export default tasksModel
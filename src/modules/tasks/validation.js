import joi from 'joi'
import JoiObjectId from "joi-objectid";
const objectId = JoiObjectId(joi);


export const addTask = joi.object({
    title:joi.string().required().min(3).max(20).pattern(new RegExp(/^[a-zA-Z0-9 ]{3,20}$/)),
    description:joi.string().required().min(10).max(250).pattern(new RegExp(/^[a-zA-Z0-9 ]{10,250}$/)),
    assignTo:objectId().required(),
    deadline:joi.date().required(),
    authorization:joi.string().required()    
}).required().unknown(true)

export const updateTask = joi.object({
    _id:objectId().required(),
    title:joi.string().min(3).max(20).pattern(new RegExp(/^[a-zA-Z0-9 ]{3,20}$/)),
    description:joi.string().min(10).max(250).pattern(new RegExp(/^[a-zA-Z0-9 ]{10,250}$/)),
    assignTo:objectId(),
    deadline:joi.date(),
    status:joi.string().valid('toDo','doing','done'),
    authorization:joi.string().required()
}).required().unknown(true)

export const deleteTask = joi.object({
    _id:objectId().required(),
    authorization:joi.string().required()
}).required().unknown(true)

export const getTasksOfOneUser=joi.object({
    authorization:joi.string().required()
}).required().unknown(true)

export const getTasksOfaUser=joi.object({
    _id:objectId().required()
}).required().unknown(true)
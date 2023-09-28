import joi from 'joi'
import JoiObjectId from "joi-objectid";
const objectId = JoiObjectId(joi);


export const changePassword = joi.object({
    newPassword:joi.string().min(8).max(25).pattern(new RegExp(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,25}$/)).required(),
    confirmPassword:joi.string().valid(joi.ref('newPassword')).required(),
    authorization:joi.string().required()   
}).required().unknown(true)

export const updateUser = joi.object({
    age:joi.number().min(15).max(100),
    firstName:joi.string().min(3).max(15).pattern(new RegExp(/^[a-zA-Z]{3,15}$/)),
    lastName:joi.string().min(3).max(15).pattern(new RegExp(/^[a-zA-Z]{3,15}$/)),
    authorization:joi.string()  
}).required().unknown(true)

export let deleteUser ='' , softDelete='' , logOut='' , getUser = ''

deleteUser =  softDelete = logOut = getUser = joi.object({
    authorization:joi.string().required()   
}).required().unknown(true)


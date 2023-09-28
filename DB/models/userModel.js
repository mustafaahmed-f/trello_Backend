
import  { Schema, Types, model } from "mongoose";


const userSchema = new Schema({
    
    userName:{type:String,required:true,unique:true},
    firstName : {type:String,required:true},
    lastName : {type:String,required:true},
    email:{type:String,required:true,unique:true,lowercase:true},
    password:{type:String,required:true},
    rePassword:{type:String},
    confirmEmail:{type:Boolean,enum:['true','false'],default:'false'},
    numOfNewConfirmReq:{type:Number,default:0},
    age:Number,
    gender:{type:String,enum:['male','female']},
    phone:{type:String,required:true,unique:true},
    isDeleted:{type:Boolean,default:'false',enum:['true','false']},
    available:{type:Boolean,default:'false',enum:['true','false']},
    profilePicture:{secure_url:String,public_id:String},
    coverImages:[{secure_url:String,public_id:String}],
    token:String

},{timestamps:true})

const userModel = model('user',userSchema)

export default userModel
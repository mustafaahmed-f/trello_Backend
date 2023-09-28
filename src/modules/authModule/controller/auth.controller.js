import bcrypt from 'bcrypt'
import userModel from '../../../../DB/models/userModel.js'
import {asyncHandler} from '../../../utils/errorHandling.js'
import {
	ReasonPhrases,
	StatusCodes,
	getReasonPhrase,
	getStatusCode,
} from 'http-status-codes';
import jwt from 'jsonwebtoken';
import sendEmail from '../../../utils/sendemail.js';
import * as validators from '../validation.js'



let timerToUnsubiscribeAccount;

const signUp = asyncHandler( async (req,res,next)=>{
    
        const {userName,email,password,age,gender,phone,rePassword,firstName,lastName} = req.body

        const getUser = await userModel.findOne({$or:[{email:email},{userName:userName},{phone:phone}]})
    if(getUser){
        // return res.json({message:"User already exists"})
        return next(new Error("Email exists !" , {cause: StatusCodes.CONFLICT}))
    }
    const hash = bcrypt.hashSync(password , parseInt(process.env.SALT_ROUND))
    const newUser = await userModel.create({userName,email,password:hash,age,gender,phone,firstName,lastName})
    const token = jwt.sign({id:newUser.id},process.env.EMAIL_SIGNATURE , {expiresIn:60*5})
    const newConfirmToken = jwt.sign({id:newUser.id},process.env.EMAIL_SIGNATURE , {expiresIn:60*60*24*14})
    const unsubscribeToken = jwt.sign({id:newUser.id},process.env.EMAIL_SIGNATURE , {expiresIn:60*60*24*14})

    const html = `<!DOCTYPE html>
    <html>
    <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
    <style type="text/css">
    body{background-color: #88BDBF;margin: 0px;}
    </style>
    <body style="margin:0px;"> 
    <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
    <tr>
    <td>
    <table border="0" width="100%">
    <tr>
    <td>
    <h1>
        <img width="100px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icaysu.png"/>
    </h1>
    </td>
    <td>
    <p style="text-align: right;"><a href="http://localhost:4200/#/" target="_blank" style="text-decoration: none;">View In Website</a></p>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    <tr>
    <td>
    <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
    <tr>
    <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
    <img width="50px" height="50px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
    </td>
    </tr>
    <tr>
    <td>
    <h1 style="padding-top:25px; color:#630E2B">Email Confirmation</h1>
    </td>
    </tr>
    <tr>
    <td>
    <p style="padding:0px 100px;">
    </p>
    </td>
    </tr>
    <tr>
    <td>
    <a href='${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}' style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Verify Email address</a>
    </td>
    <td>
    <a href="${req.protocol}://${req.headers.host}/auth/requestNewConfirmEmail/${newConfirmToken}" style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Request new confirm email</a>
    </td>
    
    </tr>

    <tr>
    <td style="margin-top:25px;padding-top:30px;">
    <a href="${req.protocol}://${req.headers.host}/auth/unsubscribeUser/${unsubscribeToken}" style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Unsubscribe</a>
    </td>
    </tr>
    
    </table>
    </td>
    </tr>
    <tr>
    <td>
    <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
    <tr>
    <td>
    <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
    </td>
    </tr>
    <tr>
    <td>
    <div style="margin-top:20px;">

    <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>
    
    <a href="${process.env.instegram}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
    </a>
    
    <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
    </a>

    </div>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    </table>
    </body>
    </html>`

    await sendEmail({from:'mostafafikry971@gmail.com',to:newUser.email,html:html,subject:'Confirm email'})

    timerToUnsubiscribeAccount = setTimeout(async ()=>{
        await userModel.findByIdAndDelete(newUser.id)
        console.log("Deleted");
    },60000*24*14)       // I will use crons ..
    

    return res.status(StatusCodes.ACCEPTED).json({message : "Signed up successfully . Please check your email to confirm registration !"})

})

const logIn = asyncHandler(
    async(req,res,next)=>{
        const {email,phone,userName ,password} = req.body;
        // console.log({email,phone,userName ,password});
        const user = await userModel.findOne({$or:[{email:email},{userName:userName},{phone:phone}]})
        if(!user){return next(new Error("User not found" , {cause:StatusCodes.NOT_FOUND}))}
        const match = await bcrypt.compare(password,user.password)
        if(!match){return next(new Error("Incorrect password !" , {cause:401}))}

        if(!user.confirmEmail){return next(new Error("Confirm email please!" , {cause:400}))}

        await userModel.findByIdAndUpdate(user._id,{available:true})

        if(user.isDeleted == true) { await userModel.findByIdAndUpdate(user._id , {isDeleted:false})}
        
        const token = jwt.sign({userName:user.userName , id:user._id},process.env.USER_TOKEN_SIGNATURE,{expiresIn:60*60})
        user.token=token
        user.save();
        
        return res.status(200).json({message:"Done",token:token})
    }
)


const confirmEmail = asyncHandler(
    async(req,res,next)=>{
        const {token} = req.params;
        const decoded = jwt.verify(token,process.env.EMAIL_SIGNATURE)
        if(!decoded?.id){return next (new Error("token is needed or payload is invalid !" , {cause:400}))}

        const user = await userModel.findByIdAndUpdate(decoded.id,{confirmEmail:true})
        if(!user){return res.send(`You dont have account , <a href="http://localhost:4200/#/signUp">Sign up !</a>`)}

        clearTimeout(timerToUnsubiscribeAccount)

        return res.redirect(`http://localhost:4200/#/login`) 
    }
)

const requestNewConfirmEmail = asyncHandler(

    async (req,res,next)=>{
        const {token} = req.params;
        const decoded = jwt.verify(token,process.env.EMAIL_SIGNATURE)
        if(!decoded?.id){return next (new Error("token is needed or payload is invalid !" , {cause:400}))}

        const user = await userModel.findById(decoded.id)
        if(!user){return res.send(`<a href = "http://localhost:4200/#/signUp">User doesn't exist ! Sign up ,please</a>`)}

        if(user.confirmEmail){return res.redirect("http://localhost:4200/#/logIn")}

        if(user.numOfNewConfirmReq == 5){
            await userModel.findByIdAndDelete(decoded.id);
            return res.send(`<p>You exceeded number of new confirm email requests (5 times) and your account will be deleted</p>`);
        }

        await userModel.findByIdAndUpdate(decoded.id,{$inc:{numOfNewConfirmReq:1}})

        const newToken = jwt.sign({id:user.id},process.env.EMAIL_SIGNATURE,{expiresIn:60*2})

        const html = `<!DOCTYPE html>
    <html>
    <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
    <style type="text/css">
    body{background-color: #88BDBF;margin: 0px;}
    </style>
    <body style="margin:0px;"> 
    <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
    <tr>
    <td>
    <table border="0" width="100%">
    <tr>
    <td>
    <h1>
        <img width="100px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icaysu.png"/>
    </h1>
    </td>
    <td>
    <p style="text-align: right;"><a href="http://localhost:4200/#/" target="_blank" style="text-decoration: none;">View In Website</a></p>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    <tr>
    <td>
    <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
    <tr>
    <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
    <img width="50px" height="50px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
    </td>
    </tr>
    <tr>
    <td>
    <h1 style="padding-top:25px; color:#630E2B">Email Confirmation</h1>
    </td>
    </tr>
    <tr>
    <td>
    <p style="padding:0px 100px;">
    </p>
    </td>
    </tr>
    <tr>
    <td>
    <a href='${req.protocol}://${req.headers.host}/auth/confirmEmail/${newToken}' style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Verify Email address</a>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    <tr>
    <td>
    <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
    <tr>
    <td>
    <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
    </td>
    </tr>
    <tr>
    <td>
    <div style="margin-top:20px;">

    <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>
    
    <a href="${process.env.instegram}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
    </a>
    
    <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
    </a>

    </div>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    </table>
    </body>
    </html>`

    await sendEmail({from:'mostafafikry971@gmail.com',to:user.email,html:html,subject:'Confirm email'})

    return res.send(`<p>Check your inbox</p>`)
    }
)

const forgotPassword = asyncHandler(
    async(req,res,next)=>{
        const{email}=req.body;
        const user = await userModel.findOne({email})
        if(!user){
            return next(new Error("User is not found !" , {cause:404}))
        }

        if(!user.confirmEmail){return next(new Error("Please confirm email firstly !" , {cause:400}))}

        const token = jwt.sign({id:user.id,email:user.email} , process.env.FORGOT_PASSWORD_SIGNATURE)

        const html = `<!DOCTYPE html>
    <html>
    <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
    <style type="text/css">
    body{background-color: #88BDBF;margin: 0px;}
    </style>
    <body style="margin:0px;"> 
    <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
    <tr>
    <td>
    <table border="0" width="100%">
    <tr>
    <td>
    <h1>
        <img width="100px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icaysu.png"/>
    </h1>
    </td>
    <td>
    <p style="text-align: right;"><a href="http://localhost:4200/#/" target="_blank" style="text-decoration: none;">View In Website</a></p>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    <tr>
    <td>
    <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
    <tr>
    <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
    <img width="50px" height="50px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
    </td>
    </tr>
    <tr>
    <td>
    <h1 style="padding-top:25px; color:#630E2B">Email Confirmation</h1>
    </td>
    </tr>
    <tr>
    <td>
    <p style="padding:0px 100px;">
    </p>
    </td>
    </tr>
    <tr>
    <td>
    <a href='http://localhost:4200/#/newPassword/${token}' style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Set new password</a>
    </td>  
    </tr>
    
    </table>
    </td>
    </tr>
    <tr>
    <td>
    <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
    <tr>
    <td>
    <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
    </td>
    </tr>
    <tr>
    <td>
    <div style="margin-top:20px;">

    <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>
    
    <a href="${process.env.instegram}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
    </a>
    
    <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
    </a>

    </div>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    </table>
    </body>
    </html>`

    await sendEmail({from:'mostafafikry971@gmail.com',to:user.email,html:html,subject:'Reset password'})

    return res.json({message:"Check your inbox !"})
    }
)

const setNewPassword = asyncHandler (
    async(req,res,next)=>{
        const{newPassword , confirmPassword} = req.body;
        const {token} = req.params;
        const decoded = jwt.verify(token , process.env.FORGOT_PASSWORD_SIGNATURE)
        if(!decoded?.id){return next(new Error("Token is required or in-valid payload" , {cause:400}))}
        if(newPassword!=confirmPassword){
            return next(new Error("Incorrect confirm password" , {cause:StatusCodes.BAD_REQUEST}))
        }
        const user = await userModel.findById(decoded.id)
        if(!user){return next(new Error("User is not found !",{cause:404}))}

        const checkOldPassword = await bcrypt.compare(newPassword,user.password)
        if(checkOldPassword){return next(new Error("New password can't be same as old password !" , {cause:400}))}

        const hash = await bcrypt.hashSync(newPassword , +process.env.SALT_ROUND);
        const newUser = await userModel.findByIdAndUpdate(decoded.id,{password:hash})
        return newUser ?  res.status(200).json({message:"Password changed successfully !"}) : next(new Error("User is not found !" , {cause:404}))
    }
)

const unsubscribeUser = asyncHandler(
    async (req,res,next)=>{
        const {token} = req.params;
        const decoded = jwt.verify(token , process.env.EMAIL_SIGNATURE)
        if(!decoded?.id){return next(new Error("Token is required or in-valid payload" , {cause:400}))}

        const user = await userModel.findById(decoded.id)

        if(!user){return next(new Error("No user found !" , {cause:404}))}
        if(user.confirmEmail==true){return res.send("Email had been already confirmed !")}

        await userModel.findByIdAndDelete(decoded.id)

        return res.status(200).send("User has been deleted successfully !")
        
    }
)

export {
    signUp,
    logIn,
    confirmEmail,
    requestNewConfirmEmail,
    forgotPassword,
    setNewPassword,
    unsubscribeUser
}
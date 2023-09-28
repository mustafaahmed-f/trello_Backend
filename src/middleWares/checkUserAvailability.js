import userModel from "../../DB/models/userModel.js";
import { asyncHandler } from "../utils/errorHandling.js";



export const checkAvailability = asyncHandler(
    async (req,res,next)=>{
      
        const user = await userModel.findById(req.user.id)
            
        if(user.available==false){return next(new Error("You must login first !!") , {cause:400})} 
        if(user.isDeleted==true){return next(new Error("Account is deleted . Login to recover it !") , {cause:400})} 
        
        return next()
    }
)


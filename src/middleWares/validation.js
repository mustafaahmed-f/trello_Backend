



export const validation = (joiSchema)=>{
    return (req,res,next)=>{

        const validationResult = joiSchema.validate({...req.body,...req.params,...req.query,...req.headers} ,{abortEarly:false})
        if(validationResult.error){
            return res.json({message:"Validation Error" , Error : validationResult.error.details})
        }

        return next();
    }
}
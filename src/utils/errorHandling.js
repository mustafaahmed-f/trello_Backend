import {
	ReasonPhrases,
	StatusCodes,
	getReasonPhrase,
	getStatusCode,
} from 'http-status-codes';

export const asyncHandler = (fn)=>{
    return (req,res,next)=>{
        fn(req,res,next).catch(err=>{
            return next(new Error(err
            ),{cause: 501})
    })
    }
}

export const globalErrorHandler = (error,req,res,next)=>{
    return res.status(error.cause || 400).json({errMSG : error.message ,status :getReasonPhrase(error.cause || 400) })
}
import multer from "multer";
import { nanoid } from "nanoid";
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';




export const fileTypeValidation = {
    image:['image/jpeg', 'image/png' ,'image/gif'],
    file:['application/pdf','application/msword','application/zip','text/html'],
    video:['video/mpeg','video/mp4']
}

//To allow any file type with tasks attachments ..
const defaultType = []

for (const type in fileTypeValidation) {
  defaultType.push(...fileTypeValidation[type])
}


function finalPathFunction(req,fullFilePath){
  let finalPath = ''

      if(req.query._id){
        finalPath = `${fullFilePath}/${req.query._id}`
      }
      else{
        finalPath = `${fullFilePath}/${req.user.id}`
      }

      return finalPath
}

export function uploadFile(filePath,filteration,filetype = defaultType) {

  const distination = fileURLToPath(import.meta.url)

  const fullFilePath = path.join(distination , `../../uploads/${filePath}`)

  
  // if(!fs.existsSync(fullFilePath)){
  //   fs.mkdirSync(fullFilePath , {recursive:true})  
  // }
 
  const storage = multer.diskStorage({ 
    destination: (req, file, cb) => {

      let finalPath = finalPathFunction(req,fullFilePath)

      
      fs.mkdirSync(finalPath , {recursive:true})  

      cb(null, `${finalPath}`)
    },


    filename: (req, file, cb) => {

        const fullFileName= nanoid() + "_" + `${req.user.id}` + "_" + file.originalname;

        // const finalPath = `${fullFilePath}/${req.user.id}`
        let finalPath = finalPathFunction(req,fullFilePath)

        fs.mkdirSync(finalPath , {recursive:true})  

        file.finalDest = `${finalPath}/${fullFileName}`
        cb(null, fullFileName);
    }
  });

  function fileFilteration(req,file,cb) {
       
    if(filetype.includes(file.mimetype)||filteration==false){
        cb(null,true)
    }
    else{
        cb(new Error("In-valid datatype") , false)
    }
  }

  const upload = multer({fileFilter:fileFilteration , storage})

  return upload;

}

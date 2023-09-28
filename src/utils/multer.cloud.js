import multer from "multer";

export const fileTypeValidation = {
    image:['image/jpeg', 'image/png' ,'image/gif'],
    file:['application/pdf','application/msword','application/zip','text/html','text/plain'],
    video:['video/mpeg','video/mp4']
}

const defaultType = []

for (const type in fileTypeValidation) {
  defaultType.push(...fileTypeValidation[type])
}



export function uploadFile(filetype = defaultType) {


  const storage = multer.diskStorage({ 
    
  });

  function fileFilteration(req,file,cb) {
       
    if(filetype.includes(file.mimetype)){
        cb(null,true)
    }
    else{
        cb(new Error("In-valid datatype") , false)
    }
  }

  const upload = multer({fileFilter:fileFilteration , storage})

  return upload;

}

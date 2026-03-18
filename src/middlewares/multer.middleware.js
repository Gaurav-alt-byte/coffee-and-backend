// whereever we need the file uploading capabilites we will enject the multer
import multer from "multer";

// read the documentation of the multer
const storage = multer.diskStorage({
    destination : function (req, file , cb)
    {
        cb(null , "./public/temp");
    },
    filename : function(req , file , cb){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null , uniqueSuffix + '-' + file.originalname);
    }
});

export const upload = multer({storage});
import {v2 as cloudinary} from "cloudinary" ;
// to get the file path we use the file system 
import fs from "fs";

cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key :process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const fileUploader = async function (localfilePath) {
    try
    {
        if(!localfilePath)
        {
            return null;
        }
        const response =  await cloudinary.uploader.upload(localfilePath , {
            resource_type :"auto"
        });
        console.log("file is uploaded on the cloudinary");
        fs.unlinkSync(localfilePath);
        return response;
    }
    catch(error)
    {
        // if the file is not uploaded successfully then we need to remove the file from the server 
        // this is done by the unlink from the file system 
        console.log(error);
        fs.unlinkSync(localfilePath);
        return null;
    }
}

export {fileUploader};






// workflow

// user will upload the file (through multer )->(store the file temp on our server ) -> upload the file to cloudinary 
// once the file is uploaded to the server then we have to remove the file from our server (file handling is required for this)
// file system comes by default with the node 

// the most important funcitonality provided by the file system of the node is unlink 
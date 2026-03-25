import { asyncHandler_2 } from "./asyncHandler.js";
import {v2 as cloudinary} from "cloudinary" ;
import { APIError } from "./APIError.js";

cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key :process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const file_delete = asyncHandler_2(async function(publicId , resourcetype = "image"){
    if(!publicId)
    {
        return null;
    }
    try
    {
        const response = await cloudinary.uploader.destroy(publicId ,{
            resource_type : resourcetype,
            invalidate : true,
        });
        console.log(response);
        return response;
    }
    catch(error)
    {
        console.log(error)
        return null;
    }
})
export {file_delete}
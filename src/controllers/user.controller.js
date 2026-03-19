import {asyncHandler_2} from "../utils/asyncHandler.js"
import { User_Model } from "../models/user.model.js"
import {APIError}  from "../utils/APIError.js"
import { fileUploader } from "../utils/cloudinary.js"
import { APIresponse } from "../utils/APIresponse.js"
const registerUser = asyncHandler_2(async(req , res , next) =>{
    // get the user data from the frontend 
    // validation of the data - not empty
    // check if user already existed 
    // check for images 
    // check for avatar
    // upload them to the cloudinary 
    // extract the url of the images from the clodinary images
    // create a user object 
    // create a create call in the db
    // check for user creation 
    // remove the password and refresh token field from the response
    // send the response

    const {email , username , fullname , password } = req.body; 

    // validating the data 

    if([email , username , fullname , password].some((field) =>{
        if(field?.trim() === "")
        {
            return true;
        }
    }))
    {
        throw new APIError(400 , "Bad request");
    }


    // checking pre existence of the user 
    const existed_user = await User_Model.findOne({
        $or : [{username} , {email}],
    })
    if(existed_user)
    {
        throw new APIError(409 , "user preexisted in the system with same user name or same email");
    }

    const avatarlocalpath =req.files?.avatar[0]?.path;
    let coverimagelocalpath;
    if(req.files && Array.isArray(req.files.cover_image) && 0 < req.files.cover_image.length)
    {
        coverimagelocalpath = req.files.cover_image[0].path;
    }

    if(!avatarlocalpath)
    {
        throw new APIError(400 , "avatar file is required");
    }

    const avatar_cloudinary = await fileUploader(avatarlocalpath);
    const cover_image_cloudinary = await fileUploader(coverimagelocalpath);    
    if(!avatar_cloudinary)
    {
        throw new APIError(500 , "internal server error");
    }
    const created_user =await User_Model.create({
        username:username.toLowerCase(),
        fullname,
        avatar : avatar_cloudinary.url,
        cover_image: cover_image_cloudinary?.url || "",
        email,
        password,
    });
    console.log(created_user);
    const creation_check  = await User_Model.findById(created_user._id).select(
        "-password -refreshToken"
    );
    if(!creation_check)
    {
        throw new APIError(500 , "internal server error");
    }
    return res.status(200).json(
        new APIresponse(200 ,creation_check, "user created successfully")
    )
})

export {registerUser}
import {asyncHandler_2} from "../utils/asyncHandler.js"
import { User_Model } from "../models/user.model.js"
import {APIError}  from "../utils/APIError.js"
import { fileUploader } from "../utils/cloudinary.js"
import { APIresponse } from "../utils/APIresponse.js"
const registerUser = asyncHandler_2(async(req , res) =>{
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

    if([email , username , fullname , password].select((field) =>{
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

    const avatarlocalpath =req.files?.avatar[0].path;
    const coverimagelocalpath = req.files.coverimage[0].path;

    if(!avatarlocalpath)
    {
        throw new APIError(400 , "avatar file is required");
    }

    const avatar_cloudinary = await fileUploader(avatarlocalpath);
    if(!avatar_cloudinary)
    {
        throw new APIError(500 , "internal server error");
    }
    if(coverimagelocalpath)
    {
        const cover_image_cloudinary = await fileUploader(coverimagelocalpath);
    }

    const created_user =await User_Model.create({
        username:username.toLowerCase(),
        fullname,
        avatar : avatar_cloudinary.url,
        cover_image: cover_image_cloudinary?.url,
        email,
        password,
    });
    const creation_check  = await User_Model.findById(created_user._id).select(
        "-password -refreshToken"
    );
    if(creation_check === false)
    {
        throw new APIError(500 , "internal server error");
    }
    return res.Status(200).json(
        new APIresponse(200 ,created_user, "user created successfully")
    )
})

export {registerUser}
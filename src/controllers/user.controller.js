import {asyncHandler_2} from "../utils/asyncHandler.js"
import { User_Model } from "../models/user.model.js"
import {APIError}  from "../utils/APIError.js"
import { fileUploader } from "../utils/cloudinary.js"
import { APIresponse } from "../utils/APIresponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"


const accessandrefreshgenerator = async function (user_id){
    try{
        const user_from_db = await User_Model.findById(user_id);
        const access_token = user_from_db.generateAccessToken();
        const refresh_token  = user_from_db.generaterefreshToken();
        user_from_db.refreshToken = refresh_token;
        await user_from_db.save({validateBeforeSave : false})
        return {access_token , refresh_token};
    }
    catch(error)
    {
        throw new APIError(500  , error.message ||"internal server error while generating token");
    }
}


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


const login_user = asyncHandler_2(async(req ,res, next) =>{

    // algorithm to login the user 
    // take the email and  password from the user
    // perform the validation on the data
    // search the database
    // get the information from the database if found
    // if not found then redirect to the register route or ask to enter the correct email and password
    // send the response to the frontend

    const {email , password , username} = req.body;
    if(!email && !username)
    {
        throw new APIError(409 , "username or email is required");
    }
    if(!password)
    {
        throw new APIError(409 , "password is required");
    }
    const db_check  = await User_Model.findOne({
        $or : [{email} , {username}],
    });
    if( !db_check)
    {
        throw new APIError("404" , "user not registered");
    }
    const password_check = await db_check.isPasswordCorrect(password);
    if(!password_check)
    {
        throw new APIError(401 , "password mismatch");
    }
    const {access_token , refresh_token} = await accessandrefreshgenerator(db_check._id);
    const loggedInuser = await User_Model.findById(db_check._id).select("-password -refreshToken");
    const options = {
        httpOnly : true,
        secure : true,
    }
    return res.status(200).cookie("accessToken" , access_token , options)
    .cookie("refreshToken" ,refresh_token , options).json(
        new APIresponse(200 , "user logged in sucessfully",{user : loggedInuser , access_token , refresh_token})
    );
});

const logoutuser = asyncHandler_2(async function(req , res, next) {
    //we will add a middleware to access the user so that logout can be performed
    // in that method we will add a user to the request so that we can access the user here 

    const user_refrence = await User_Model.findByIdAndUpdate(req.user._id ,
        {
            $set : {
                refreshToken : undefined,
            }
        },
        {
            new : true,
        }
    );
    const options = {
        httpOnly : true,
        secure : true,
    }
    return res
    .status(201)
    .clearCookie("accessToken" ,options)
    .clearCookie("refreshToken" , options)
    .json(
        new APIresponse(200 ,{}, "user logged out successfully")
    );

});

const refreshaccesstoken = asyncHandler_2(async function(req , res , next) {
    try
    {
        const incomingrefresh_token = req.cookies.refreshToken||req.body.refreshToken;
        if(!incomingrefresh_token)
        {
            throw new APIError(401 , "unauthorized request");
        }
        const decrypted_token = jwt.verify(incomingrefresh_token , process.env.REFRESH_TOKEN_SECRET);
        if(!decrypted_token)
        {
            throw new APIError(401 , "unauthorized access");
        }
        const user_refrence = await User_Model.findById(decrypted_token._id);
        if(!user_refrence)
        {
            throw new APIError(401 , "invalid refresh token");
        }
        if(user_refrence.refreshToken !== incomingrefresh_token){
            throw new APIError(401 , "refresh token mismatch");
        }

        const options = {

            httpOnly : true,
            secure : true,
        }
        const {access_token , new_refresh_token} = await accessandrefreshgenerator(user_refrence._id);
        return res.status(200)
        .cookie("accessToken" , access_token , options)
        .cookie("refreshToken" ,new_refresh_token , options)
        .json(
            new APIresponse(200 , "token refreshed successfully",{ access_token , refreshToken : new_refresh_token})
        );
    }
    catch(error)
    {
        throw new APIError(401 , error.message || "user not authenticated");
    }

})

const changecurrentpassword = asyncHandler_2(async function (req , res , next) {
    const {oldpassword , newPassword} = req.body;
    const user_refrence = await User_Model.findById(user._id);
    const password_check = await user_refrence.isPasswordCorrect(oldpassword);
    if(!password_check)
    {
        throw new APIError(401 ,"unauthorized access");
    }
    user_refrence.password = newPassword;
    await user_refrence.save({validateBeforeSave : false});
    return res.status(200).json(
        new APIresponse(200 , {} , "password changed successfully")
    )
})


const getUser = asyncHandler_2(async function (req,res, next) {
    return res.status(200).json(
        200 , req.user , "current user is fetched successfully"
    )
})

const updateaccountDetails = asyncHandler_2(async function (req , res , next){
    const {email , fullname} = req.body;
    if(!email && !fullname)
    {
        throw new APIError(401 ,"all the fileds are required");
    }
    const user_refrence = User_Model.findByIdAndUpdate(req.user._id , 
        {
            $set : {
                fullname:fullname,
                email:email,
            }
        },
        {
            new : true,
        }
    ).select("-password");
    return res.status(200).json(
        new APIresponse(200 , user_refrence , "user details updated successfully")
    )
})

const UpdateUserAvatar = asyncHandler_2(async function (req , res , next) {
    try
    {
        const localfilepath_newAvatar = req.file.path;
        if(!localfilepath_newAvatar)
        {
            throw new APIError(404 , "new imaage is needed");
        }
        const new_avatar_cloudinary = await fileUploader(localfilepath_newAvatar);
        if(!new_avatar_cloudinary)
        {
            throw new APIError(500 , "internal server error image upload failed");
        }
        const user_refrence = await User_Model.findByIdAndUpdate(req.user._id ,
            {
                $set : {
                    avatar : new_avatar_cloudinary.url,
                }
            },

            {
                new : true
            }
        ).select("-password -refreshToken");
        return res.status(201).json(
            new APIresponse(200 , user_refrence , "image updated successfully")
        )
    }
    catch(error)
    {
        throw new APIError(500 ,"imageUpdationFailed");
    }

});

const updateUserCoverImage = asyncHandler_2(async function (req, res, next) {

    try
    {
        const localfilepath_newcover = req.file.path;
        if(!localfilepath_newcover)
        {
            throw new APIError(404 , "new image is needed");
        }
        const new_CoverImage_cloudinary = await fileUploader(localfilepath_newcover);
        if(!new_CoverImage_cloudinary)
        {
            throw new APIError(500 , "internal server error image upload failed");
        }
        const user_refrence = await User_Model.findByIdAndUpdate(req.user._id ,
            {
                $set : {
                    avatar : new_CoverImage_cloudinary.url,
                }
            },

            {
                new : true
            }
        ).select("-password -refreshToken");
        return res.status(201).json(
            new APIresponse(200 , user_refrence , "image updated successfully")
        )
    }
    catch(error)
    {
        throw new APIError(500 ,"imageUpdationFailed");
    }
})

const getuserchannelprofile = asyncHandler_2(async function (req , res, next) {
    const {username} = req.params;
    if(!username?.trim())
    {
        throw new APIError(400 , "username is missing");
    }
    const channel = await User_Model.aggregate([
        {
            $match : {
                username : username?.toLowerCase()
            },
        },
        {
            $lookup : {
                from : "subscriptions",
                localField :"_id",
                foreignField : "channel",
                as : "Subscribers"
            }
        },
        {
            $lookup : {
                from : "subscriptions",
                localField :"_id",
                foreignField : "subscriber",
                as : "SubscribedTo",
            }
        },
        {
            $addFields : {
                SubscribersCount: {
                    $size : "$Subscribers",
                },
                SubscribedToCount: {
                    $size : "$SubscribedTo",
                },
                isSubscribed : {
                    $cond : {
                        if :{ $in : [new mongoose.Types.ObjectId(req.user._id) , "$Subscribers.subscriber"]},
                        then : true,
                        else : false,
                    }
                }
            }
        },
        {
            $project:{
                fullname:1,
                email : 1,
                cover_image :1,
                avatar : 1,
                SubscribedToCount:1,
                SubscribersCount:1,
                isSubscribed:1,
                username :1,
            }
        }
    ])

    if(!channel?.length)
    {
        throw new APIError(404 , "User not found")
    }
    return res.status(200).json(
        new APIresponse(200 , channel[0] , "user channel fetched successfully")
    )
});


const getWatchHistory = asyncHandler_2(async function(req , res , next) {
    const user_refrence = await User_Model.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField : "watch_history",
                foreignField: "_id",
                as : "watched_Videos",
                pipeline : [
                    {
                        $lookup :{
                            from : "user_models",
                            localField : "owner",
                            foreignField : "_id",
                            as : "owner",
                            pipeline : [
                                {
                                    $project : {
                                        fullname:1,
                                        email:1,
                                        avatar:1,
                                        cover_image:1,
                                        password:0,
                                        refreshToken:0,
                                        watch_history :0,

                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields :{
                            owner : {$first : "$owner"}
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200).json(
        new APIresponse(200 , user_refrence[0].watched_Videos , "History fetched successfully")
    )
})
export {registerUser ,
    login_user,
    logoutuser,
    refreshaccesstoken,
    changecurrentpassword,
    getUser,
    updateaccountDetails,
    UpdateUserAvatar,
    updateUserCoverImage,
    getuserchannelprofile,
    getWatchHistory,
};
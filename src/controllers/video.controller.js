import { asyncHandler_2 } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { APIresponse } from "../utils/APIresponse.js";
import { fileUploader } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import mongoose from "mongoose";
import { User_Model } from "../models/user.model.js";
import { getWatchHistory } from "./user.controller.js";

const video_uploader = asyncHandler_2(async function (req , res, next) {
    // first authenticate the user using the authentication middleware
    // take the tittle description from req.body
    // use the multer to take the video file and thumbnail file on the server temp
    // upload those files on the server 
    // take out the duration from the cloudinary video object
    // take both the url 
    // create the video in the mongodb
    // return the response 
    const {tittle , description} = req.body;
    const videolocalpath = req.files?.videotobeUploaded[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    if(!videolocalpath || !thumbnailLocalPath)
    {
        throw new APIError(401 , "all the fields are required");
    }
    const cloudinary_video= await fileUploader(videolocalpath);
    const cloudinary_thumbnail = await fileUploader(thumbnailLocalPath);
    if(!cloudinary_video || !cloudinary_thumbnail)
    {
        throw new APIError(500 ,"cloudinary upload failed")
    }
    console.log(cloudinary_video);
    const cloudinary_video_url = cloudinary_video.url;
    const cloudinary_thumbnail_url = cloudinary_thumbnail.url;
    const video_duration = cloudinary_video.duration;
    const created_video = await Video.create({
        tittle : tittle,
        description : description,
        owner : req.user._id,
        thumbnail : cloudinary_thumbnail_url,
        video_file : cloudinary_video_url,
        duration : video_duration,
        is_published:true,
        views:0,

    });
    console.log(created_video);
    if(!created_video)
    {
        throw new APIError(500 , "internal server error");
    }

    return res.status(200).json(
        new APIresponse(200 , created_video , "Video Uploaded successfully")
    )
})

const viewUpdater = asyncHandler_2(async function(req , res , next) {

    const{VideoId} =req.params;
    if(!VideoId)
    {
        throw new APIError(404 , "Video not found")
    }
    const video_refrence = await Video.findByIdAndUpdate(VideoId ,
        {
            $inc : {
                views:1
            }
        },
        {
            new : true,
        }
    )
    if(!req.user)
    {
        return res.status(201).json(
            new APIresponse(200 ,video_refrence , "views updated successfully")
        )
    }
    const user_refrence = await User_Model.findByIdAndUpdate(req.user._id,
        {
            $addToSet :{
                watch_history : VideoId,
            }
        },
        {
            new : true,
        }
    )
    console.log(user_refrence);
    return res.status(200).json(
        new APIresponse(200 , {video_info : video_refrence , user : user_refrence} ,"views and History Updated SuccessFully")
    )
})

const feedGenerator = asyncHandler_2(async function(req , res, next){
    const Videos_avail = await (Video.find({is_published : true} )).sort({createdAt : -1}).populate("owner" , "username avatar");
    console.log(Videos_avail);
    if(!Videos_avail)
    {
        throw new APIError(500 , "internal server error feed load failed");
    }
    return res.status(200).json(
        new APIresponse(200 ,"feed fetched successfully" ,Videos_avail)
    )
})

const allUploads = asyncHandler_2(async function (req, res, next) {
    try
    {
        const allUploads = await Video.aggregate([
            {
                $match : {
                    owner : new mongoose.Types.ObjectId(req.user._id)
                }
            },
            {
                $sort :{
                    createdAt : -1
                }
            },
            {
                $lookup :{
                    from : "user_models",
                    localField : "owner",
                    foreignField : "_id",
                    as : "Video_owner",
                    pipeline : [
                        {
                            $project :{
                                username:1,
                            }
                        }
                    ]
                }
            },
            {
                $addFields :{
                    ownerDetails : {$first : "$Video_owner"}
                }
            },
            {
                $project :{
                    createdAt:1,
                    is_published:1,
                    tittle:1,
                    description:1,
                    ownerDetails:1,
                    thumbnail:1,
                    video_file:1,
                    views:1,
                    duration:1,
                }
            }
        ])
        if(!allUploads)
        {
            throw new APIError(404 , "user has not uploaded anything yet");
        }
        console.log(allUploads);
        return res.status(200).json(
            new APIresponse(200 , allUploads[0], "all the updates hase been fetched successfully")
        )
    }
    catch(error)
    {
        throw new APIError(500 , "internal server error upload fetched failed");
    }
})
export {
    video_uploader,
    viewUpdater,
    feedGenerator,
    allUploads
}
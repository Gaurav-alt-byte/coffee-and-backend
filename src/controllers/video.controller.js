import { asyncHandler_2 } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { APIresponse } from "../utils/APIresponse.js";
import { fileUploader } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import mongoose from "mongoose";
import { User_Model } from "../models/user.model.js";
import { file_delete } from "../utils/cloudinary_delete.js";

const video_uploader = asyncHandler_2(async function (req , res, next) {
    const {tittle , description} = req.body;
    const videolocalPath = req.files?.videotobeUploaded?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    if(!videolocalPath || !thumbnailLocalPath)
    {
        throw new APIError(401 , "all the fields are required");
    }
    const cloudinary_video= await fileUploader(videolocalPath);
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
    ).select("-password -refreshToken")
    console.log(user_refrence);
    return res.status(200).json(
        new APIresponse(200 , {video_info : video_refrence , user_history : user_refrence.watch_history} ,"views and History Updated SuccessFully")
    )
})

const feedGenerator = asyncHandler_2(async function(req , res, next){
    const Videos_avail = await (Video.find({is_published : true} )).sort({createdAt : -1}).populate("owner" , "username avatar").select("-video_file");
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
        const allUploads_video = await Video.aggregate([
            {
                $match : {
                    owner : new mongoose.Types.ObjectId(req.user._id)
                }
            },
            // {
            //     $sort :{
            //         createdAt : -1
            //     }
            // },
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
        if(!allUploads_video?.length)
        {
            throw new APIError(404 , "user has not uploaded anything yet");
        }
        console.log(allUploads_video);
        return res.status(200).json(
            new APIresponse(200 ,"all the uploads has been fetched successfully",{upload_data :allUploads_video})
        )
    }
    catch(error)
    {
        throw new APIError(500 , "internal server error upload fetched failed");
    }
})

const togglepublishStatus = asyncHandler_2(async function (req, res, next) {
    try
    {
        const {VideoId} = req.params;
        if(!VideoId)
        {
            throw new APIError(404 ,"url not found")
        }
        const video_refrence = await Video.findById(VideoId);
        if(!video_refrence)
        {
            throw new APIError(404 , "Video not found");
        }
        if(req.user?._id.toString()!== video_refrence.owner.toString())
        {
            throw new APIError(409 , "unauthorized access");
        }
        video_refrence.is_published = !video_refrence.is_published;
        await video_refrence.save({validateBeforeSave : false});
        return res.status(200).json(
            new APIresponse(200 , "Status Changed Successfully" ,{publish_status :video_refrence.is_published})
        )
    }
    catch(error)
    {
        throw new APIError(500 , error.message||"internal server error");
    }
})

const VideoDelete = asyncHandler_2(async function(req, res, next) {
    const {VideoId} = req.params;
    if(!VideoId)
    {
        throw new APIError(404 , "url not found");
    }
    const video_refrence =  await Video.findById(VideoId);
    if(!video_refrence)
    {
        throw new APIError(404 , "video not found");
    }
    if(video_refrence.owner.toString() !== req.user?._id.toString())
    {
        throw new APIError(400 , "Unauthorized access");
    }
    const video_file = video_refrence.video_file;
    const deletion_from_db = await Video.findByIdAndDelete(VideoId);
    const delete_response = file_delete(video_file , "video");
    if(!delete_response || !deletion_from_db)
    {
        throw new APIError(500 ,"video delteion failed");
    }
    return res.status(200).json(
        new APIresponse(200 ,"video delted from cloudinary", delete_response)
    )

})


const getVideoById = asyncHandler_2(async function(req ,res, next) {
    const{VideoId} = req.params;
    if(!VideoId)
    {
        throw new APIError(404 , "url not found");
    }
    const video_refrence = await Video.aggregate([
        {
            $match :{
                _id : new mongoose.Types.ObjectId(VideoId)
            }
        },
        {
            $lookup :{
                from : "user_models",
                localField : "owner",
                foreignField : "_id",
                as : "owner_info",
                pipeline : [
                    {
                        $project :{
                            fullname:1,
                            avatar:1,
                            cover_image:1,
                            username:1,
                        }
                    }
                ]
            }
        },
        {
            $addFields :{
                ownerDetails : {$first : "$owner_info"}
            }
        },
        {
            $project:{
                is_published:1,
                video_file:1,
                thumbnail:1,
                ownerDetails:1,
                duration:1,
                tittle:1,
                description:1,
                views:1,
            }
        }
    ])
    if(!video_refrence?.length)
    {
        throw new APIError(404 , "no video found with this id");
    }
    return res.status(200).json(
        new APIresponse(200 , "Video Details Fetched Successfully" , video_refrence[0])
    )
})
const UpdateVideo = asyncHandler_2(async function (req, res, next){
    const {VideoId} = req.params;
    if(!VideoId)
    {
        throw new APIError(404 , "Invalid url");
    }
    const video_refrence = await Video.findById(VideoId);
    if(!video_refrence)
    {
        throw new APIError(404 , "Video not found");
    }
    if(req.user._id.toString() !== video_refrence.owner.toString())
    {
        throw new APIError(401 , "unauthorized access");
    }
    const old_thumbnail = video_refrence.thumbnail;
    let{new_tittle , new_description} = req.body;
    const new_thumbnail_LocalPath = req.file?.path;
    let updateThumbnail = video_refrence.thumbnail;
    if(new_thumbnail_LocalPath)
    {
        const cloudinary_new_thumbnail = await fileUploader(new_thumbnail_LocalPath);
        if(!cloudinary_new_thumbnail)
        {
            throw new APIError(500 , "image upload to cloudinary failed");
        }
        updateThumbnail = cloudinary_new_thumbnail.url;
        const delete_response = await file_delete(old_thumbnail);
    }
    video_refrence.thumbnail = updateThumbnail;
    video_refrence.tittle = (new_tittle !== "" && new_tittle.trim() !== "")?new_tittle :video_refrence.tittle;
    video_refrence.description = (new_description !== "" && new_description.trim() !== "")?new_description:video_refrence.description;
    await video_refrence.save({validateBeforeSave:false});
    return res.status(200).json(
        new APIresponse(200 , "video Details are updated successfully",video_refrence)
    )
})
export {
    video_uploader,
    viewUpdater,
    feedGenerator,
    allUploads,
    togglepublishStatus,
    VideoDelete,
    getVideoById,
    UpdateVideo,
}
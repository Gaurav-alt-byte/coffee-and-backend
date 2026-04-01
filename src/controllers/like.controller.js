import {Like_Model} from "../models/like.model.js"
import { Video } from "../models/video.model.js";
import { APIError } from "../utils/APIError.js";
import { APIresponse } from "../utils/APIresponse.js";
import {asyncHandler_2} from "../utils/asyncHandler.js"
import mongoose from "mongoose";
import { DisLike_Model } from "../models/dislike.model.js";

const likingContent = asyncHandler_2(async function(req ,res, next) {
    if (!req.user?._id) throw new APIError(401, "You must be logged in");
    const{Content_Id} = req.params;
    const {type} = req.body;
    if(!Content_Id || !type)
    {
        throw new APIError(401 ,"type and contend id is required");
    }
    const existing_like = await Like_Model.findOne(
        {
            content_id : Content_Id,
            OnModel:type,
            liked_by:req.user._id,
        }
    )
    if(existing_like)
    {
        const delete_refrence = await Like_Model.findByIdAndDelete(existing_like._id);
        if(!delete_refrence)
        {
            throw new APIError(500 ,"error while removing the like from Content");
        }
        return res.status(200).json(
            new APIresponse(200 , "like removed successfully")
        )
    }
    const  existing_dislike = await DisLike_Model.findOneAndDelete({content_id : Content_Id , disliked_by : req.user._id , OnModel : type});
    const created_like = await Like_Model.create(
        {
            content_id:Content_Id,
            OnModel:type,
            liked_by:req.user._id,
        }
    )
    if(!created_like)
    {
        throw new APIError(500 , "internal server error")
    }
    return res.status(200).json(
        new APIresponse(200 , `${type} liked successfully"` , created_like),
    )
})

const getlikedVideos = asyncHandler_2(async function(req, res, next){
    if(!req.user)
    {
        throw new APIError(401 , "unauthorized access")
    }
    const liked_videos = await Like_Model.find({liked_by:req.user._id , OnModel : "Video"}).select("content_id");
    if(!liked_videos)
    {
        return res.status(200).json(
            new APIresponse(200 , "Liked Videos Fetches Successfully")
        )
    }
    return res.status(200).json(
        new APIresponse(200 , "Liked Videos Fetched Successfully" , liked_videos)
    )
})

const getLikesOnContent = asyncHandler_2(async function (req ,res, next){
    const {ContentId} = req.params;
    if(!ContentId)
    {
        throw new APIError(401 , "Bad request");
    }
    const{type} = req.body;
    const Likes =  await Like_Model.aggregate([
        {
            $match :{
                OnModel:type,
                content_id:new mongoose.Types.ObjectId(ContentId),
            }
        },
        {
            $project:{
                liked_by:1,
            }
        }
    ])
    const total_likes = Likes?.length;
    return res.status(200).json(
        new APIresponse(200 , "like count fetched successfully" , {likes_count : total_likes , user_ids:Likes})
    )
})
export {
    likingContent,
    getlikedVideos,
    getLikesOnContent,
}
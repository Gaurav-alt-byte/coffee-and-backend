import mongoose from "mongoose";
import {DisLike_Model} from "../models/dislike.model.js"
import { APIError } from "../utils/APIError.js";
import { APIresponse } from "../utils/APIresponse.js";
import {asyncHandler_2} from "../utils/asyncHandler.js"
import { Like_Model } from "../models/like.model.js";


const dislikingContent = asyncHandler_2(async function(req ,res, next) {
    if (!req.user?._id) throw new APIError(401, "You must be logged in");
    const{Content_Id} = req.params;
    const {type} = req.body;
    if(!Content_Id || !type)
    {
        throw new APIError(401 ,"type and contend id is required");
    }
    const existing_Dislike = await DisLike_Model.findOne(
        {
            content_id : Content_Id,
            OnModel:type,
            disliked_by:req.user._id,
        }
    )
    if(existing_Dislike)
    {
        const delete_refrence = await DisLike_Model.findByIdAndDelete(existing_Dislike._id);
        if(!delete_refrence)
        {
            throw new APIError(500 ,"error while removing the dislike from Content");
        }
        return res.status(200).json(
            new APIresponse(200 , "dislike removed successfully")
        )
    }
    const existing_like = await Like_Model.findOneAndDelete({liked_by : req.user._id , content_id : Content_Id , OnModel : type})
    const created_Dislike = await DisLike_Model.create(
        {
            content_id:Content_Id,
            OnModel:type,
            disliked_by:req.user._id,
        }
    )
    if(!created_Dislike)
    {
        throw new APIError(500 , "internal server error")
    }
    return res.status(200).json(
        new APIresponse(200 , `${type} Disliked successfully"` , created_Dislike),
    )
})

const getDislikedVideos = asyncHandler_2(async function(req, res, next){
    if(!req.user)
    {
        throw new APIError(401 , "unauthorized access")
    }
    const Disliked_videos = await DisLike_Model.find({disliked_by:req.user._id , OnModel : "Video"}).select("content_id");
    if(!Disliked_videos)
    {
        return res.status(200).json(
            new APIresponse(200 , "disLiked Videos Fetches Successfully")
        )
    }
    return res.status(200).json(
        new APIresponse(200 , "disLiked Videos Fetched Successfully" , Disliked_videos)
    )
})

const getdisLikesOnContent = asyncHandler_2(async function (req ,res, next){
    const {ContentId} = req.params;
    if(!ContentId)
    {
        throw new APIError(401 , "Bad request");
    }
    const{type} = req.body;
    const disLikes = await  DisLike_Model.aggregate([
        {
            $match :{
                OnModel:type,
                content_id: new mongoose.Types.ObjectId(ContentId),
            }
        },
        {
            $project:{
                disliked_by:1,
            }
        }
    ])
    const total_dislikes = disLikes?.length;
    return res.status(200).json(
        new APIresponse(200 , "like count fetched successfully" , {dislikes_count : total_dislikes , user_ids:disLikes})
    )
})
export {
    dislikingContent,
    getDislikedVideos,
    getdisLikesOnContent,
}
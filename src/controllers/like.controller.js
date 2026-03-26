import {Like_Model} from "../models/like.model.js"
import { Video } from "../models/video.model.js";
import { APIError } from "../utils/APIError.js";
import { APIresponse } from "../utils/APIresponse.js";
import {asyncHandler_2} from "../utils/asyncHandler.js"
import mongoose from "mongoose";


const likingContent = asyncHandler_2(async function(req ,res, next) {
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
        const removed_like = await Like_Model.findByIdAndDelete(existing_like._id);
        await  mongoose.model(type).findByIdAndUpdate(Content_Id , 
            {
                $inc :{
                    like_counts : -1,
                }
            },
            {
                new : true,
            }
        )
        return res.status(200).json(
            new APIresponse(200 , "like removed successfully" , removed_like)
        )
    }
    const created_like = await Like_Model.create(
        {
            content_id:Content_Id,
            OnModel:type,
            liked_by:req.user._id,
        }
    )

    await mongoose.model(type).findByIdAndUpdate(Content_Id, 
        {
            $inc :{
                like_counts: 1,
            }
        },
        {
            new:true,
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
    const liked_videos = await Like_Model.find({liked_by:req.user._id , OnModel : "Video"}).select("contend_id");
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
export {
    likingContent,
    getlikedVideos,
}
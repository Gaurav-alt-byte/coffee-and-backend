import mongoose from "mongoose";
import {Subscription} from "../models/subscriptions.model.js"
import { User_Model } from "../models/user.model.js";
import { APIError } from "../utils/APIError.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asyncHandler_2 } from "../utils/asyncHandler.js"

const Subscribechannel = asyncHandler_2(async function (req, res , next)
{

    const {ChannelId} = req.params;
    if(!req.user)
    {
        throw new APIError(401 , "Unauthorized access")
    }
    if(!ChannelId)
    {
        throw new APIError(400 ,"Bad request");
    }
    const exisiting_subscriber = await Subscription.findOne({subscriber : req.user._id , channel : ChannelId});
    if(exisiting_subscriber)
    {
        return res.status(200).json(
            new APIresponse(200 , "Channel Already Subscribed" , exisiting_subscriber)
        )
    }
    const Created_Subscriber = await Subscription.create({
        subscriber:req.user._id,
        channel:ChannelId,
    })
    if(!Created_Subscriber)
    {
        throw new APIError(500 , "Internal server Error");
    }
    return res.status(200).json(
        new APIresponse(200 , "Channel Subscribed Successfully" , Created_Subscriber)
    )
})

const UnSubscribe = asyncHandler_2(async function(req, res, next){
    const {ChannelId} = req.params;
    if(!req.user)
    {
        throw new APIError(401 , "Unauthorized access");
    }
    if(!ChannelId)
    {
        throw new APIError(401 , "Bad request")
    }
    const subscriber_refrence = await Subscription.findOne({subscriber : req.user._id ,channel : ChannelId});
    if(!subscriber_refrence)
    {
        throw new APIError(404 , "no subscriber found")
    }
    await Subscription.findByIdAndDelete(subscriber_refrence._id);
    return res.status(200).json(
        new APIresponse(200 , "channel Unsubscribed Successfully")
    )
})


const getallSubscriber = asyncHandler_2(async function(req , res, next)
{
    const{ChannelId} = req.params
    if(!req.user)
    {
        throw new APIError(401 , "unauthorized access")
    }
    if(!ChannelId)
    {
        throw new APIError(401 , "Bad request");
    }
    if(req.user._id.toString() !== ChannelId.toString())
    {
        throw new APIError(401 ,"unauthorized access")
    }
    const all_subscribers = await Subscription.aggregate([
        {
            $match :{
                channel : new mongoose.Types.ObjectId(ChannelId),
                status : "Active"
            }
        },
        {
            $lookup :{
                from:"user_models",
                localField : "subscriber",
                foreignField :"_id",
                as :"subscriber_info",
                pipeline : [
                    {
                        $project :{
                            username:1,
                            fullname:1,
                            cover_image:1,
                            SubscribersCount:1,
                            avatar:1,
                            _id:1,
                        }
                    },
                ]
            }
        },
        {
            $addFields :{
                Subscriber_detail : {
                    $first : "$subscriber_info"
                }
            }
        },
        {
            $project :{
                Subscriber_detail:1,
                subscriber:1,

            }
        }
    ])
    if(!all_subscribers?.length)
    {
        return res.status(200).json(
            new APIresponse(200 , "no Subscriber found")
        )
    }
    return res.status(200).json(
        new APIresponse(200 , "all subscriber fetched successfully" , all_subscribers)
    )
})

const removeSubscriber = asyncHandler_2(async function (req, res, next){
    const {UserId} = req.params
    if(!UserId)
    {
        throw new APIError(400, "Bad request")
    }
    if(!req.user)
    {
        throw new APIError(401 , "Unauthorized Access");
    }
    const subscriber_refrence = await Subscription.findOne({subscriber:UserId , channel:req.user._id})
    if(!subscriber_refrence)
    {
        throw new APIError(404 , "User not found")
    }
    const delete_refrence = await Subscription.findByIdAndDelete(subscriber_refrence._id);
    if(!delete_refrence)
    {
        throw new APIError(500 , "internal server error")
    }
    return res.status(200).json(
        new APIresponse(200 , "user removed successfully")
    )
})

const BlockUser = asyncHandler_2(async function(req, res, next)
{
    const{UserId} = req.params;
    if(!UserId)
    {
        throw new APIError(401 , "User id is not found")
    }
    if(!req.user)
    {
        throw new APIError(401 , "Unauthorized Access");
    }
    const subscription_refrence = await Subscription.findOne({subscriber:UserId , channel:req.user._id , status : "Active"});
    if(!subscription_refrence)
    {
        throw new APIError(404 ,"User not found");
    }
    subscription_refrence.status = "Blocked"
    await subscription_refrence.save({validateBeforeSave : false});
    return res.status(200).json(
        new APIresponse(200 , "User Blocked Successfully" , subscription_refrence.status)
    )
})

const UnblockUser = asyncHandler_2(async function(req, res , next){
    const{UserId} = req.params;
    if(!UserId)
    {
        throw new APIError(401  ,"UserId not found");
    }
    if(!req.user)
    {
        throw new APIError(401 ,"unatuhorized access")
    }
    const subscription_refrence = await Subscription.findOneAndUpdate({subscriber : UserId , channel : req.user._id},
        {
            $set : {
                status : "Active",
            }
        },
        {
            new : true,
        }
    )
    if(!subscription_refrence)
    {
        throw new APIError(404 , "Subscriber not found");
    }
    return res.status(200).json(
        new APIresponse(200 , "User unblocked successfully" , subscription_refrence.status)
    )
})
export {
    Subscribechannel,
    UnSubscribe,
    getallSubscriber,
    removeSubscriber,
    BlockUser,
    UnblockUser,
}
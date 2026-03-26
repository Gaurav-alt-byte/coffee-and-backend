import {asyncHandler_2} from "../utils/asyncHandler.js"
import {APIError} from "../utils/APIError.js"
import { Tweets } from "../models/tweets.model.js"
import {APIresponse} from "../utils/APIresponse.js"
import mongoose from "mongoose"
const createTweet = asyncHandler_2(async function (req, res, next)
{
    if(!req.user)
    {
        throw new APIError(401 , "Unauthorized access")
    }
    const {tittle , main_content} = req.body;
    if(!tittle || !main_content)
    {
        throw new APIError(401 , "all the fields are required");
    }
    const tweet_refrence = await Tweets.create({
        tittle : tittle,
        main_content : main_content,
        owner:req.user._id,
    });
    if(!tweet_refrence)
    {
        throw new APIError(500 , "internal server erorr Tweet creation failed");
    }
    return res.status(200).json(
        new APIresponse(200 ,"Tweet created Successfully")
    )
})


const delete_Tweet = asyncHandler_2(async function(req, res, next){

    if(!req.user)
    {
        throw new APIError(401 , "Unauthorized access")
    }
    const{TweetId}= req.params;
    if(!TweetId)
    {
        throw new APIError(401 , "Bad request");
    }

    const tweet_refrence = await Tweets.findOne({owner : req.user._id , _id : TweetId});
    if(!tweet_refrence)
    {
        throw new APIError(404 , "no Tweet found")
    }
    const delete_refrence = await Tweets.findByIdAndDelete(tweet_refrence._id);
    if(!delete_refrence)
    {
        throw new APIError(500 ,"deletion failed")
    }
    return res.status(200).json(
        new APIresponse(200 , "Tweet Deleted Successfully" , delete_refrence)
    )
})


const modify_tweet = asyncHandler_2(async function (req, res, next)
{
    if(!req.user)
    {
        throw new APIError(401 , "Unauthorized access")
    }
    const{TweetId}= req.params;
    if(!TweetId)
    {
        throw new APIError(401 , "Bad request");
    }
    const tweet_refrence = await Tweets.findOne({owner :req.user._id , _id : TweetId});
    if(!tweet_refrence)
    {
        throw new APIError(404  ,"no Tweet found");
    }
    const{new_tittle , new_main_content} = req.body;
    new_tittle = (new_tittle !== "" && new_tittle.trim() !== "")?new_tittle:tweet_refrence.tittle;
    new_main_content = (new_main_content.trim() !== "" && new_main_content !== "")?new_main_content.trim():tweet_refrence.main_content;
    tweet_refrence.tittle = new_tittle;
    tweet_refrence.main_content = new_main_content;
    const save_refrence = await tweet_refrence.save({validateBeforeSave : false});
    if(!save_refrence)
    {
        throw new APIError(500 , "tweet modification failed");
    }
    return res.status(200).json(
        new APIresponse(200 , "Tweet modified successfully" , tweet_refrence)
    )
})


const tweetFeedGenrator = asyncHandler_2(async function(req, res, next)
{
    const page = parseInt(req.query.page)||1;
    const limit = parseInt(req.query.limit)||10;
    const skip = (page-1)*limit;

    const all_tweets = await Tweets.aggregate([
        {
            $match : {
                is_published: true
            }
        },
        {
            $sort : {
                createdAt : -1,
            }
        },
        {
            $skip : skip,
        },
        {
            $limit : limit,
        },

        {
            $lookup : {
                from :"user_models",
                localField:"owner",
                foreignField : "_id",
                as : "owner_info",
                pipeline : [
                    {
                        $project :{
                            username:1,
                            fullname :1,
                            avatar :1,
                            cover_image:1,
                            _id:1,
                        }
                    }
                ]
            }
        },
        {
            $lookup : {
                from : "like_models",
                localField : "_id",
                foreignField :"content_id",
                as : "likes",
                pipeline : [
                    {
                        $match : {
                            OnModel : "Tweets"
                        }
                    },
                    {
                        $lookup :{
                            from :"user_models",
                            localField : "liked_by",
                            foreignField : "_id",
                            as : "user_info",
                            pipeline : [
                                {
                                    $project :{
                                        username :1,
                                        fullname:1,
                                        avatar:1,
                                        _id:1,
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        },
        {
            $addFields :{
                owner_details : {
                    $first : "$owner_info"
                },
                liked_counts : {
                    $size : "$likes"
                },
                is_Liked: {
                    $cond: {
                        if: { $ne: [req.user?._id, undefined] },
                        then: {
                            $in: [new mongoose.Types.ObjectId(req.user?._id), "$likes.liked_by"]
                        },
                        else: false
                    }
                }
            }
        },
        {
            $project :{
                tittle :1,
                main_content:1,
                owner_details:1,
                createdAt:1,
                updatedAt :1,
                liked_counts:1,
                is_Liked : 1
            }
        }
    ])
    if(!all_tweets?.length)
    {
        return res.status(200).json(
            new APIresponse(200 , "No Tweets found")
        )
    }
    return res.status(200).json(
        new APIresponse(200 , "feed fetched successfully" , all_tweets)
    )
})
export {
    createTweet,
    delete_Tweet,
    modify_tweet,
    tweetFeedGenrator,
}
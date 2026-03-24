import mongoose, { Mongoose } from "mongoose";
const like_Schema = new mongoose.Schema({
    liked_by : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User_Model",
        required:true,
    },
    video_liked :{
        type : mongoose.Schema.Types.ObjectId,
        ref :"Video",
    },
    tweet_liked :{
        type : Mongoose.Schema.Types.ObjectId,
        ref : "Tweets",
    },
    comment_liked : {
        type : Mongoose.Schema.Types.ObjectId,
        ref :"Comment_Model",
    }
} , {timestamps : true});

export const Like_Model = mongoose.model("Like_Model" ,like_Schema);
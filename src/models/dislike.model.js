import mongoose, { Mongoose } from "mongoose";
const Dislike_Schema = new mongoose.Schema({
    disliked_by : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User_Model",
        required:true,
    },
    content_id : {
        type : mongoose.Schema.Types.ObjectId,
        refPath:"OnModel",
        required:true,
    },
    OnModel :{
        type:String,
        required:true,
        enum :["Video" ,"Tweets" ,"Comment_Model"]
    }
} , {timestamps : true});

export const DisLike_Model = mongoose.model("DisLike_Model" ,Dislike_Schema);
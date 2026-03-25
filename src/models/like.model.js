import mongoose, { Mongoose } from "mongoose";
const like_Schema = new mongoose.Schema({
    liked_by : {
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

export const Like_Model = mongoose.model("Like_Model" ,like_Schema);
import mongoose, { MongooseError } from "mongoose";
const Comment_Schema = new mongoose.Schema({
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User_MOdel",
        required:true,
    },
    content : {
        type : String,
        required : true,
    },
    commented_at : {
        type : mongoose.Schema.Types.ObjectId,
        refPath: "OnModel",
    },
    OnModel :
    {
        type:String,
        required:true,
        enum : ["Video" , "Tweets"]
    },

} ,{timestamps : true,});

export const Comment_Model = mongoose.model("Comment_Model" , Comment_Schema);
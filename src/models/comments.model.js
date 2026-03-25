import mongoose, { MongooseError } from "mongoose";
const comment_Schmea = new mongoose.Schema({
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
        ref: "Video",
    },

} ,{timestamps : true,});

export const Comment_Model = mongoose.model("Comments" , comment_Schmea);
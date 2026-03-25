import mongoose from "mongoose";
const Tweets_Schema = new mongoose.Schema({

    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref:"User_Model",
        required : true,
    },
    content : {
        type : String,
        required : true,
    },
    
}, {timestamps : true,});


export const Tweets = mongoose.model("Tweets" , Tweets_Schema);
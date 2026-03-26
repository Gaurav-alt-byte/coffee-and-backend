import mongoose from "mongoose";
const Tweets_Schema = new mongoose.Schema({

    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref:"User_Model",
        required : true,
    },
    tittle : {
        type : String,
        required:true,
    },
    main_content : {
        type : String,
        required : true,
    },
    is_published : {
        type : Boolean,
        required:true,
        default : true,
    }
    
}, {timestamps : true,});


export const Tweets = mongoose.model("Tweets" , Tweets_Schema);
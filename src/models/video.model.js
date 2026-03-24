import mongoose, { Schema, Types } from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const Video_Schema  = mongoose.Schema({

    video_file : {
        type : String, // cloudnary url
        required : true,
        unique:true,
    }, 
    thumbnail : {
        type : String,
        required : true,
        unique:true,
    },
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User_Model",
        required : true,
        unique : true,
    },
    tittle : {
        type : String,
        required:true,
        trim : true,
    },

    description : {
        type : String,
        required : true,
    },

    duration : {
        type : Number,
        required:true,
    }, 

    views: {
        type : Number,
        required: true,
        default : 0,
    },

    is_published : {
        type : Boolean,
        required:true,
    }
} , {timestamps : true});

Video_Schema.plugin(mongooseAggregatePaginate);
export const Video = mongoose.model("Video" , Video_Schema);
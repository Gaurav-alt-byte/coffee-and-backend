import mongoose from "mongoose";
const Playlist_Schema = new mongoose.Schema({

    name :{
        type : String,
        required: true,
    },
    description : {
        type : String,
        required : true,
    },
    Videos : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Video",
        }
    ],
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User_Model",
        required : true,
    }

} ,{timestamps : true});


export const Playlist = mongoose.model("Playlist" , Playlist_Schema);
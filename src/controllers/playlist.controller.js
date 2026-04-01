import { Playlist } from "../models/playlist.model.js";
import { asyncHandler_2 } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { APIresponse} from "../utils/APIresponse.js";

const create_playlist = asyncHandler_2(async function(req, res, next){
    if(!req.user)
    {
        throw new APIError(401 , "Unauthorized access")
    }
    const {name , description , is_private} = req.body;
    if(!name || !description)
    {
        throw new APIError(401 , "all the fields are required");
    }
    const new_playlist = await Playlist.create({
        owner : req.user._id,
        name : name,
        description:description,
        is_private:is_private||false,
        Videos :[],
    })
    if(!new_playlist)
    {
        throw new APIError(500 , "internal server error Playlist creation failed")
    }
    return res.status(200).json(
        new APIresponse(200,"Playlist created successfully" , new_playlist)
    )
})

const DeletePlaylist = asyncHandler_2(async function(req , res, next) {
    if(!req.user)
    {
        throw new APIError(400 , "Unauthorized Access");
    }
    const{PlaylistId} = req.params;
    if(!PlaylistId)
    {
        throw new APIError(401  ,"Bad request");
    }
    const delete_refrence = await Playlist.findOneAndDelete({owner : req.user._id , _id :PlaylistId});
    if(!delete_refrence)
    {
        throw new APIError(404 , "no playlist found");
    }
    return res.status(200).json(
        new APIresponse(200 , "Playlist deleted Successfully" , delete_refrence)
    )
})

const addVideo = asyncHandler_2(async function(req, res, next){
    if(!req.user)
    {
        throw new APIError(401 , "Unauthorized access")
    }
    const{PlaylistId} = req.params;
    const{VideoId}= req.params;
    if(!PlaylistId || !VideoId)
    {
        throw new APIError(401,"Bad Request");
    }
    const playlist_refrence = await Playlist.findOneAndUpdate({owner : req.user._id , _id : PlaylistId},
        {
            $addToSet :{
                Videos : VideoId
            }
        },
        {
            new : true,
            runValidators : false
        }
    )
    if(!playlist_refrence)
    {
        throw new APIError(404 ,"No playlist found");
    }
    return res.status(200).json(
        new APIresponse(200 , "Video Added SuccessFully" , playlist_refrence)
    )
})

const removeVideo = asyncHandler_2(async function(req, res , next){
    if(!req.user)
    {
        throw new APIError(401 , "Unauthorized access")
    }
    const{PlaylistId} = req.params;
    const{VideoId}= req.params;
    if(!PlaylistId || !VideoId)
    {
        throw new APIError(401,"Bad Request");
    }
    const playlist_refrence = await Playlist.findOneAndUpdate({owner : req.user._id , _id : PlaylistId} ,
        {
            $pull:{
                Videos : VideoId
            }
        },
        {
            new : true,
            runValidators:false
        }
    )
    if(!playlist_refrence)
    {
        throw new APIError(404 , "No PlayList found");
    }
    return res.status(200).json(
        new APIresponse(200 , "Video Removed Successfully")
    )
})


const getPlaylistById = asyncHandler_2(async function(req, res, next) {
    const { PlaylistId } = req.params;
    if (!PlaylistId) {
        throw new APIError(400, "Playlist ID is required");
    }

    const playlist = await Playlist.findById(PlaylistId).populate({
        path: "Videos",
        match: { is_published: true },
        select: "tittle views thumbnail duration likes_count owner",
        populate: {
            path: "owner",
            select: "username avatar"
        }
    });

    if (!playlist) {
        throw new APIError(404, "Playlist not found");
    }

    const isOwner = req.user?._id?.toString() === playlist.owner.toString();
    if (playlist.is_private && !isOwner) {
        throw new APIError(403, "This playlist is private");
    }

    return res.status(200).json(
        new APIresponse(200, "Playlist fetched successfully", playlist)
    );
});

const allplaylist = asyncHandler_2(async function(req, res, next) {
    if (!req.user) {
        throw new APIError(401, "Unauthorized access");
    }

    const playlists = await Playlist.find({ owner: req.user._id })
        .select("name description is_private Videos createdAt")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new APIresponse(200, "User playlists fetched", playlists)
    );
});


const editPlaylist = asyncHandler_2(async function(req, res, next){
    if(!req.user)
    {
        throw new APIError(401 , "Unauthorized access")
    }
    const{PlaylistId} = req.params;
    if(!PlaylistId)
    {
        throw new APIError(400 , "Bad request");
    }
    const {name , description , is_private} = req.body;
    const playlist_refrence =  await Playlist.findOneAndUpdate({owner : req.user._id , _id : PlaylistId} ,
        {
            $set:{
                name : name,
                description:description,
                is_private:is_private,
            }
        },
        {
            new : true,
            runValidators:false,
        }
    )
    if(!playlist_refrence)
    {
        throw new APIError(404 ,"no playlist found or you are not the owner")
    }
    return res.status(200).json(
        new APIresponse(200 , "playlist updated successfully" , playlist_refrence)
    )
})
export {
    create_playlist,
    addVideo,
    removeVideo,
    getPlaylistById,
    allplaylist,
    DeletePlaylist,
    editPlaylist,
};
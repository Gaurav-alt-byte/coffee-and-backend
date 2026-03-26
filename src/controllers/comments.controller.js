import {Comment_Model} from "../models/comments.model.js"
import { APIError } from "../utils/APIError.js"
import { APIresponse } from "../utils/APIresponse.js";
import { asyncHandler_2 } from "../utils/asyncHandler.js"


const comment_creator = asyncHandler_2(async function(req, res, next) {
    if(!req.user)
    {
        throw new APIError(401 , "UnauthorizedAccess");
    }
    const{type} = req.body;
    const {ContentId} = req.params;
    if(!type || !ContentId)
    {
        throw new APIError(401,"Bad request")
    }

    const{main_content} = req.body;
    if(main_content === "" || main_content.trim() === "")
    {
        throw new APIError(401 , "all the fileds are required")
    }

    const created_comment = await Comment_Model.create({
        owner:req.user._id,
        content : main_content,
        OnModel : type,
        commented_at:ContentId,
    });
    if(!created_comment)
    {
        throw new APIError(500 , "internal server error");
    }
    return res.status(200).json(
        new APIresponse(200 ,"comment Posted SuccessFully" , created_comment)
    )
});

const comment_edit = asyncHandler_2(async function (req, res, next){
    if(!req.user)
    {
        throw new APIError(401 , "UnauthorizedAccess");
    }
    const{type} = req.query;
    const {CommentId} = req.params;
    if(!type || !CommentId)
    {
        throw new APIError(401,"Bad request")
    }
    let {new_content} = req.body;
    const comment_refrence = await Comment_Model.findOne({_id : CommentId , owner : req.user._id , OnModel : type});
    if(!comment_refrence)
    {
        throw new APIError(404 , "Comment not found");
    }
    new_content = (!new_content||  new_content.trim() === "")?comment_refrence.content:new_content;
    comment_refrence.content = new_content;
    const save_refrence = await comment_refrence.save({validateBeforeSave : false});
    if(!save_refrence)
    {
        throw new APIError (500 , "internal server error")
    }
    return res.status(200).json(
        new APIresponse(200 , "comment Modified Successfully" , comment_refrence)    
    )
})


export{
    comment_creator,
    comment_edit,
}
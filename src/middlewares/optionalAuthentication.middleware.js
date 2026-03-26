import { asyncHandler_2 } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User_Model } from "../models/user.model.js";

const Optionalauthentication = asyncHandler_2(async function(req, res , next) {
    try
    {
        const token_string = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer " ,"");
        if(!token_string)
        {
            return next()
        }
        const decoded_token = jwt.verify(token_string , process.env.ACCESS_TOKEN_SECRET);

        const user_from_db = await User_Model.findById(decoded_token?._id).select("-password -refreshToken");
        if(user_from_db)
        {
            req.user = user_from_db;
        }
        return next();
    }
    catch(error)
    {
        return next();
    }
})

export{Optionalauthentication}
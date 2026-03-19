import {asyncHandler_2} from "../utils/asyncHandler.js"

const registerUser = asyncHandler_2(async(req , res) =>{
    res.status(200).json({
        message:"ok",
    });
})

export {registerUser}
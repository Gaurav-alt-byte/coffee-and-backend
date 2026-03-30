
// const asyncHandler = (requestHandler) =>{
//     return (req , res , next)=>
//     {
//         Promise.resolve(requestHandler(req , res ,next)).catch((error) =>{
//             next(error);
//         })
//     };
// };

// export {asyncHandler}



// another way to write the asyncHandler 
const asyncHandler_2 = (requestHandler)=>{
    return async (req , res , next )=>{
        try{
            await requestHandler(req , res , next);
            console.log("task is established");
        }
        catch(error)
        {
            console.log(error.message)
            next(error);
        }
    }
}

export {asyncHandler_2}
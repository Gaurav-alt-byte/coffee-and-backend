
import connectDB from "./db/index.js";
import dotenv from "dotenv"
import { app } from "./app.js";
import { asyncHandler_2 } from "./utils/asyncHandler.js";

dotenv.config({
    path:'./.env'
});
connectDB().then(()=>{
    app.listen(process.env.PORT , () =>{
        console.log(`the app is listening at ${process.env.PORT || 8000}`)
    })
}).catch((error)=>{
    console.log("MongoDB connection failed" , error);
})
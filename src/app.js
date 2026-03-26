import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
const app = express();


app.use(cors({
    origin:process.env.CORS_ORIGIN,
}));

app.use(express.json({
    limit:'16kb',
    strict : 'true'
}));

app.use(express.urlencoded({
    extended:true,
}));
app.use(express.static("public"));
app.use(cookieParser());


// importing router 

import Userrouter from "./routes/user.routes.js"

import Videorouter from "./routes/video.routes.js"

import Likerouter from "./routes/like.routes.js"
import subscriberouter from "./routes/subscribe.route.js"


// routes declaration 

app.use("/api/v1/users" , Userrouter);
app.use("/api/v1/videos" , Videorouter);
app.use("/api/v1/likes" , Likerouter);
app.use("/api/v1/Subscriptions" , subscriberouter);
export {app}
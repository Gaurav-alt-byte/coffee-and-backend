import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
const app = express();


app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
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
import tweetrouter from "./routes/tweet.route.js"
import commentrouter from "./routes/comment.routes.js"
import playlistrouter from "./routes/playlist.routes.js"
import dislikerouter from "./routes/dislike.routes.js"

// routes declaration 

app.use("/api/v1/users" , Userrouter);
app.use("/api/v1/videos" , Videorouter);
app.use("/api/v1/likes" , Likerouter);
app.use("/api/v1/Subscriptions" , subscriberouter);
app.use("/api/v1/Twitter" , tweetrouter);
app.use("/api/v1/Comments" , commentrouter);
app.use("/api/v1/Playlists" , playlistrouter);
app.use("/api/v1/dislikes" ,dislikerouter );


app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || [],
    });
});
export {app}
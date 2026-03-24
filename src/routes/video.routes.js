import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { allUploads, feedGenerator, video_uploader, viewUpdater } from "../controllers/video.controller.js";
const router = Router();


//secured_routes

router.route("/upload-video").post(authentication , upload.fields([
    {
        name : "videotobeUploaded",
        maxCount : 1,
    },
    {
        name : "thumbnail",
        maxCount :1,
    }
]) , video_uploader);

router.route("/watch-Videos").get(feedGenerator);

//securedroutes
router.route("/watch/:VideoId").get(authentication,viewUpdater);
router.route("/all-uploads").get(authentication , allUploads);
export default router;

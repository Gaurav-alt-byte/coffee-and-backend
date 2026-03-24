import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { video_uploader, viewUpdater } from "../controllers/video.controller.js";
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
router.route("/watch/:VideoId").post(authentication,viewUpdater);


export default router;

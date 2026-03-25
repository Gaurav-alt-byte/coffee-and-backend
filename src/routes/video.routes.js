import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { allUploads, feedGenerator, getVideoById, togglepublishStatus, UpdateVideo, video_uploader, VideoDelete, viewUpdater } from "../controllers/video.controller.js";
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
router.route("/search/:VideoId").get(getVideoById)

//securedroutes
router.route("/watch/:VideoId").get(authentication,viewUpdater);
router.route("/all-uploads").get(authentication , allUploads);
router.route("/change-publish-status/:VideoId").post(authentication, togglepublishStatus);
router.route("/delete-video/:VideoId").post(authentication , VideoDelete);
router.route("/update-details/:VideoId").patch(authentication,upload.single('newThumbnail'), UpdateVideo);
export default router;

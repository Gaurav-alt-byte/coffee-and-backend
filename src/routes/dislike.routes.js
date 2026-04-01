import { Router } from "express";
const router = Router(); 
import { dislikingContent , getDislikedVideos , getdisLikesOnContent } from "../controllers/dislike.controller.js";
import { authentication } from "../middlewares/auth.middleware.js";
router.route("/toggle/:Content_Id").post(authentication , dislikingContent)
router.route("/Disliked-videos").get(authentication , getDislikedVideos)
router.route("/Dislikes-count/:ContentId").post(getdisLikesOnContent);


export default router;
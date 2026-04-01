import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware.js";
import { getlikedVideos, getLikesOnContent, likingContent } from "../controllers/like.controller.js";

const router = Router();

// secured_routes

router.route("/toggle/:Content_Id").post(authentication , likingContent)
router.route("/liked-videos").get(authentication , getlikedVideos)
router.route("/likes-count/:ContentId").get(getLikesOnContent);


export default router;
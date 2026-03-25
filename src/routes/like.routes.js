import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware.js";
import { likingContent } from "../controllers/like.controller.js";

const router = Router();

// secured_routes

router.route("/toggle/:Content_Id").post(authentication , likingContent)


export default router;
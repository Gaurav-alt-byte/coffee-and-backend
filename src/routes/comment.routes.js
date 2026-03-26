import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware.js";
import { comment_creator } from "../controllers/comments.controller.js";

const router = Router();
router.route("/create-comment/:ContentId").post(authentication , comment_creator);

export default router
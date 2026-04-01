import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware.js";
import { comment_creator, comment_edit, delete_comment } from "../controllers/comments.controller.js";

const router = Router();
router.route("/create-comment/:ContentId").post(authentication , comment_creator);
router.route("/edit-comment/:CommentId").patch(authentication , comment_edit);
router.route("/delete/:CommentId").post(authentication , delete_comment);

export default router
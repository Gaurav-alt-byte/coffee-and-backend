import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware.js";
import { createTweet, delete_Tweet, getTweetById, modify_tweet, tweetFeedGenrator } from "../controllers/tweet.controller.js";
import { Optionalauthentication } from "../middlewares/optionalAuthentication.middleware.js";
import { comment_creator, deleteTweetReply, getTweetReplies } from "../controllers/comments.controller.js";
const router = Router()

router.route("/tweet/all").get(Optionalauthentication,tweetFeedGenrator);
router.route("tweet/:TweetId").get(getTweetById);
router.route("/tweet/:ContentId/replies").get(Optionalauthentication,getTweetReplies);
//secured routes 
router.route("/tweet/create").post(authentication , createTweet),
router.route("/tweet/:ContentId/comment").post(authentication , comment_creator)
router.route("/tweet/manage/delete/:TweetId").delete(authentication , delete_Tweet);
router.route("/tweet/manage/update/:TweetId").patch(authentication , modify_tweet);
router.route("/tweet/manage/:TweetId/delete-reply").post(authentication , deleteTweetReply);
export default router
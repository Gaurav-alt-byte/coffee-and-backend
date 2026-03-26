import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware.js";
import { createTweet, delete_Tweet, modify_tweet, tweetFeedGenrator } from "../controllers/tweet.controller.js";
import { Optionalauthentication } from "../middlewares/optionalAuthentication.middleware.js";
const router = Router()

router.route("/tweet/all").get(Optionalauthentication,tweetFeedGenrator);
//secured routes 
router.route("/tweet/create").post(authentication , createTweet),
router.route("/tweet/manage/delete/:TweetId").delete(authentication , delete_Tweet);
router.route("/tweet/manage/update/:TweetId").patch(authentication , modify_tweet);
export default router
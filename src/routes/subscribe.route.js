import { Router} from "express";
import { BlockUser, getallSubscriber, removeSubscriber, Subscribechannel, UnblockUser, UnSubscribe } from "../controllers/subscribe.controller.js";
import { authentication } from "../middlewares/auth.middleware.js";
const router = Router();


// secured routes 

router.route("/subscribe/:ChannelId").post(authentication , Subscribechannel);
router.route("/unsubscribe/:ChannelId").patch(authentication , UnSubscribe);
router.route("/all-subscriber/:ChannelId").get(authentication , getallSubscriber);
router.route("/subscribers/remove/:UserId").delete(authentication , removeSubscriber);
router.route("/subscribers/Block/:UserId").patch(authentication , BlockUser);
router.route("/subscribers/unblock/:UserId").patch(authentication , UnblockUser);

export default router

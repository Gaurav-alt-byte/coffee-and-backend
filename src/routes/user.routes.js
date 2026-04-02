import { Router } from "express";
import { changecurrentpassword, clearHistory, getUser, getuserchannelprofile, getWatchHistory, refreshaccesstoken, registerUser, updateaccountDetails, UpdateUserAvatar, updateUserCoverImage , searchUsers , verifyEmail } from "../controllers/user.controller.js";
import { login_user } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authentication } from "../middlewares/auth.middleware.js";
import { logoutuser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1,
        },
        {
            name : "cover_image",
            maxCount : 1,
        }
    ]),
    registerUser);
router.route("/login").post(login_user);

// secured_routesc
router.route("/logout").post(authentication , logoutuser);
router.route("/refresh-token").post(refreshaccesstoken);
router.route("/change-password").post(authentication , changecurrentpassword);
router.route("/change-avatar").patch(authentication ,upload.single('newAvatar') , UpdateUserAvatar);
router.route("/change-cover-image").patch(authentication , upload.single('newCover'),updateUserCoverImage);
router.route("/current-user").get(authentication , getUser);
router.route("/Update-details").patch(authentication , updateaccountDetails);
router.route("/channel/:username").get(authentication , getuserchannelprofile);
router.route("/history").get(authentication , getWatchHistory);
router.route("/clear-history").patch(authentication , clearHistory)
router.route("/search-users").get(searchUsers);
router.route("/verify/:token").get(verifyEmail);
export default router;
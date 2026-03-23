import { Router } from "express";
import { changecurrentpassword, refreshaccesstoken, registerUser, UpdateUserAvatar } from "../controllers/user.controller.js";
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
router.route("/change-avatar").post(authentication ,upload.single('newAvatar') , UpdateUserAvatar)

export default router;
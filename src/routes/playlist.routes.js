import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware.js";
import { addVideo, allplaylist, create_playlist, DeletePlaylist, getPlaylistById, removeVideo } from "../controllers/playlist.controller.js";
const router = Router();

// securedroutes;

router.route("/user/playlist/create").post(authentication, create_playlist)
router.route("/user/:PlaylistId/:VideoId/add").patch(authentication , addVideo);
router.route("/user/:PlaylistId/:VideoId/remove").patch(authentication , removeVideo);
router.route("/user/:PlaylistId/view").get(authentication , getPlaylistById);
router.route("/user/playlist/all").get(authentication,allplaylist);
router.route("/user/:PlaylistId/delete").post(authentication , DeletePlaylist)
export default router;
import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middle.js"
import {toggleVideoLike,toggleCommentLike,getLikedVideos} from "../controllers/like.controller.js"
const router = Router()

router.route("/video-toggole/c/:videoId").get(verifyJWT,toggleVideoLike)
router.route("/comment-toggole/c/:commentId").get(verifyJWT,toggleCommentLike)
router.route("/get-liked-videos").get(verifyJWT,getLikedVideos)
export default router
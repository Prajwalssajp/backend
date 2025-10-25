import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middle.js";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";

const router = Router()

router.route('/add-comment/c/:videoId').post(verifyJWT,addComment)
router.route('/update-comment/c/:commentId').patch(verifyJWT,updateComment)
router.route('/delete-comment/c/:commentId').delete(verifyJWT,deleteComment)
router.route('/get-video-comments/c/:videoId').get(verifyJWT,getVideoComments)
export default router
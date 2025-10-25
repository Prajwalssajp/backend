import { Router} from "express";
import { verifyJWT } from "../middlewares/auth.middle.js";
import { upload } from "../middlewares/multer.middle.js";
import {publishVideo,getVideoById,updateVideo,deleteVideo,toggolePublishStatus,getAllVideos} from "../controllers/video.controller.js"

const router = Router()
// router.use(verifyJWT) apply verifyJWT for all routes
router.route('/upload').post(verifyJWT,upload.fields([
    {
        name:"videoFile",
        maxCount:1
    },
    {
        name:"thumbnail",
        maxCount:1
    }
]),publishVideo
)
// router.route('/delete/:').delete(verifyJWT,deleteVideo)
router.route('/c/:videoId').get(verifyJWT,getVideoById)
router.route('/c/:videoId/update-video').post(verifyJWT,upload.single("thumbnail"),updateVideo)
router.route('/c/:videoId/delete').delete(verifyJWT,deleteVideo)
router.route('/toggole-publishstatus/c/:videoId').get(verifyJWT,toggolePublishStatus)
router.route('/get-all-videos/c/:userId').get(verifyJWT,getAllVideos)
export default router
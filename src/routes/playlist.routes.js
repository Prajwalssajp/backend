import Router from "express"
import { verifyJWT } from "../middlewares/auth.middle.js"
import {createPlaylist,getPlaylistById, addVideoToPlaylist,removeVideoFromPlaylist,updatePlaylist,deletePlaylist,getUserPlaylist } from "../controllers/playlist.controller.js"
const router = Router()

router.route("/create-playlist").patch(verifyJWT,createPlaylist)
router.route("/get/c/:playlistId").get(verifyJWT,getPlaylistById )
router.route("/addvideo/c/:playlistId/:videoId").get(verifyJWT,addVideoToPlaylist )
router.route("/removevideo/c/:playlistId/:videoId").get(verifyJWT,removeVideoFromPlaylist )
router.route("/update-playlist/c/:playlistId").patch(verifyJWT,updatePlaylist )
router.route("/delete-playlist/c/:playlistId").delete(verifyJWT,deletePlaylist )
router.route("/get-user-playlist/c/:playlistId").delete(verifyJWT,getUserPlaylist )
export default router
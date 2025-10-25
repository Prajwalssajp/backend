import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middle.js"
import {createTweet,updateTweet,deleteTweet,getUserTweets} from "../controllers/tweet.controller.js"
const router = Router()

router.route('/create-tweet').patch(verifyJWT,createTweet)
router.route('/update-tweet/c/:tweetId').patch(verifyJWT,updateTweet)
router.route('/delete-tweet/c/:tweetId').delete(verifyJWT,deleteTweet)
router.route('/get-user-tweet').get(verifyJWT,getUserTweets)

export default router
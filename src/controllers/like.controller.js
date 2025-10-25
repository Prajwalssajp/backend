import { Like } from "../models/like.module.js";
import { ApiError } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { Video } from "../models/video.module.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { Comment } from "../models/comment.module.js";
import mongoose, { mongo } from "mongoose";


const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video Id is required");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Invalid Video Id");
  }
  const like = await Like.findOne({
    video: video._id,
    likedBy: req.user,
  });
  let message;
  if (!like) {
    await Like.create({
      video: video._id,
      likedBy: req.user,
    });
    message = "Video Liked Succesfully";
  } else {
    await Like.deleteOne();
    message = "Video unliked succesfully";
  }
  return res.status(200).json(new ApiResponse(200, {}, message));
});

const toggleCommentLike = asyncHandler(async(req,res)=>{
    const {commentId} = req.params
    if (!commentId) {
    throw new ApiError(400, "Comment Id is required");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "Invalid Comment Id");
  }
  const like = await Like.findOne({
    comment: comment._id,
    likedBy: req.user,
  });
  let message;
  if (!like) {
    await Like.create({
      comment: comment._id,
      likedBy: req.user,
    });
    message = "Comment Liked Succesfully";
  } else {
    await Like.deleteOne();
    message = "Comment unliked succesfully";
  }
  return res.status(200).json(new ApiResponse(200, {}, message));
})

const toggleTweetLike = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params
    if (!tweetId) {
    throw new ApiError(400, "Tweet Id is required");
  }
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(400, "Invalid Tweet Id");
  }
  const like = await Like.findOne({
    tweets: tweet._id,
    likedBy: req.user,
  });
  let message;
  if (!like) {
    await Like.create({
      tweets: tweet._id,
      likedBy: req.user,
    });
    message = "Tweet Liked Succesfully";
  } else {
    await Like.deleteOne();
    message = "Tweet unliked succesfully";
  }
  return res.status(200).json(new ApiResponse(200, {}, message));
})

const getLikedVideos = asyncHandler(async(req,res)=>{
  const likevideos = await Like.aggregate([
    {
      $match:{
        likedBy:new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup:{
        from:"videos",
        localField:"video",
        foreignField:"_id",
        as:"videodetails"
      }
    },
    {
      $addFields:{
        videodetails:{"$first":"$videodetails"}
      }
    },
    {
      $project:{
        video:1,
        "videodetails.thumbnail":1,
        "videodetails.title":1,
        "videodetails.descripition":1,
        "videodetails.duration":1,
      }
    }
  ])
  return res
    .status(200)
    .json(new ApiResponse(200,likevideos,"Liked videos fetched succesfully"))
})
export { toggleVideoLike, toggleCommentLike,toggleTweetLike,getLikedVideos };

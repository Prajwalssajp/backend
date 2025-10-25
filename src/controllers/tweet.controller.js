import mongoose from "mongoose";
import { Tweet } from "../models/tweet.module.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) {
    throw new ApiError(400, "Content is Required");
  }
  const tweet = await Tweet.create({
    content:content.trim(),
    owner: req.user._id,
  });
  if (!tweet) {
    throw new ApiError(400, "Error while Creating Tweet");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet Created Succesfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Content is Required");
  }
  if (!tweetId) {
    throw new ApiError(400, "Tweet Id is Required");
  }
  const tweet = await Tweet.findOneAndUpdate(
    {
    _id:tweetId,owner:req.user._id
    },
    {
        $set:{
            content:content.trim()
        }
    },
    {
        new:true
    }
)
  if (!tweet) {
    throw new ApiError(400, "Tweet not found or not authorized");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet Updated Succesfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(400, "Tweet Id is Required");
  }
  const tweet = await Tweet.findByIdAndDelete(
    {
        _id:tweetId,
        owner:req.user._id
    }
  )
   if (!tweet) {
    throw new ApiError(400, "Tweet not found or not authorized");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet Delted Succesfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
    const usertweets = await Tweet.aggregate([
      {
        $match:{
          owner:new mongoose.Types.ObjectId(req.user._id)
        }
      },
      {
        $lookup:{
          from:"users",
          localField:"owner",
          foreignField:"_id",
          as:"ownerDetails"
        }
      },
      {
        $project:{
          content:1,
          owner:1,
          "ownerDetails.username":1,
          "ownerDetails.email":1,
          "ownerDetails.fullname":1,
          "ownerDetails.avatar":1,
        }
      }
    ])
    return res
      .status(200)
      .json(new ApiResponse(200,usertweets || {},"User Tweets fetched succesfully"))
}) 
export { createTweet, updateTweet,deleteTweet,getUserTweets };

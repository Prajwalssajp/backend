import mongoose from "mongoose";
import { Video } from "../models/video.module.js";
import { Subscription } from "../models/subscription.module.js";
import { Like } from "../models/like.module.js";
import { User } from "../models/user.module.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const channelId = req.user._id;
  const channelStats = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "channelSubscribers",
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "videoUploads",
        pipeline: [
          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "video",
              as: "totalLikes",
            },
          },
          {
            $addFields: {
              likesCount: { $size: "$totalLikes" },
            },
          },
          {
            $project: {
              title: 1,
              thumbnail: 1,
              description: 1,
              duration: 1,
              likesCount:1
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscriberCount: { $size: "$channelSubscribers" },
        videoUploadCount: { $size: "$videoUploads" },
        totalLikesOnChannel: { $sum: "$videoUploads.likesCount" },
      },
    },
    {
      $project: {
        _id: 1,
        fullname: 1,
        username: 1,
        avatar: 1,
        subscriberCount: 1,
        videoUploadCount: 1,
        totalLikesOnChannel: 1,
        "videoUploads.title": 1,
        "videoUploads.thumbnail": 1,
        "videoUploads.likesCount": 1,
        
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(200, channelStats[0] || {}, "Stats Feched succesfully")
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const channelId = req.user._id;
  const channelVideos = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "allVideos",
      },
    },
    {
      $project: {
        username:1,
        "allVideos.title": 1,
        "allVideos.thumbnail": 1,
        "allVideos.description": 1,
        "allVideos.duration": 1,
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(200, channelVideos, "Channel Videos Fetched Succesfully")
    );
});

export { getChannelStats, getChannelVideos };

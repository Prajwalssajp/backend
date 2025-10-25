import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.module.js";
import { Subscription } from "../models/subscription.module.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(400, "Channel id is Required");
  }
  const user = await User.findById(channelId);
  if (!user) {
    throw new ApiError(400, "Invalid Channel Id");
  }
  const subscriber = await Subscription.findOneAndDelete({
    channel: channelId,
    subscriber: new mongoose.Types.ObjectId(req.user._id),
  });
  if (!subscriber) {
    await Subscription.create({
      channel: channelId,
      subscriber: new mongoose.Types.ObjectId(req.user._id),
    });
  }
  if (subscriber) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Unsubscribed successfully"));
  } else {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Subscribed successfully"));
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(400, "Channel id is Required");
  }

  const UserChannelSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberDetails",
      },
    },
    {
      $addFields: {
        subscriberDetails: { "$first": "$subscriberDetails" },
      },
    },
    {
      $project: {
        "subscriberDetails.username": 1,
        "subscriberDetails.email": 1,
        "subscriberDetails.fullname": 1,
        "subscriberDetails.avatar": 1,
      },
    },
  ]);
  const subscriberCount = UserChannelSubscribers.length;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { UserChannelSubscribers, subscriberCount },
        "Subscribers Calculated Succesfully"
      )
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!subscriberId) {
    throw new ApiError(400, "Subscriber id is Required");
  }
  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedDetails",
      },
    },
    {
      $addFields: {
        subscribedDetails: { "$first": "$subscribedDetails" },
      },
    },
    {
      $project: {
        "subscribedDetails.username": 1,
        "subscribedDetails.email": 1,
        "subscribedDetails.fullname": 1,
        "subscribedDetails.avatar": 1,
      },
    },
  ]);
  const subscribedCount = subscribedChannels.length;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribedChannels, subscribedCount },
        "Subscriberd channels Calculated Succesfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };

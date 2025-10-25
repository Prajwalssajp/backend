import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { Comment } from "../models/comment.module.js";
import mongoose from "mongoose";

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "content is required");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });
  if (!comment) {
    throw new ApiError(400, "Error while adding Comment");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment Added Succesfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Content Id is Required");
  }
  if (!commentId) {
    throw new ApiError(400, "Comment Id is Required");
  }
  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: content,
    },
    {
      new: true,
    }
  );
  if (!comment) {
    throw new ApiError(404, "Comment Not Found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment updated Succesfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Comment Id is required");
  }
  const comment = await Comment.findByIdAndDelete(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment Not Found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment delted Succesfully"));
});

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }
  const allComments = await Comment.aggregate([
    {
      $match:{
        video:new mongoose.Types.ObjectId(videoId)
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
      $addFields:{
        ownerDetails:{"$first":"$ownerDetails"}
      },
    },
    {
        $project:{
        content: 1,
        "ownerDetails.fullname": 1,
        "ownerDetails.username": 1,
        "ownerDetails.avatar": 1
      }
    }
  ])
  return res
  .status(200)
  .json(new ApiResponse(200,allComments,"Comments fetched succesfully"))
});
export { addComment, updateComment, deleteComment,getVideoComments};

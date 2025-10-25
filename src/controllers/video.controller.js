import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import { Video } from "../models/video.module.js";
import {
  uploadOnCloudinary,
  deleteOldFilesOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiresponse.js";
import mongoose from "mongoose";

const publishVideo = asyncHandler(async (req, res) => {
  // get video details from frontend
  //  check video is exit alredy
  // upload video on cloudinary
  const { title, descripition } = req.body;
  const userId = req.user?._id
  // console.log(title);
  // console.log(descripition);
  // console.log(duration);

  if ([title, descripition].some((fields) => fields?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  const videoLocalPath = req.files?.videoFile?.[0].path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0].path;
  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail file is required");
  }
  const videoCloudinary = await uploadOnCloudinary(videoLocalPath);
  // console.log(videoCloudinary);

  const thumbnailCloudinary = await uploadOnCloudinary(thumbnailLocalPath);
  if (!videoCloudinary) {
    throw new ApiError(400, "Video file required!!!");
  }
  if (!thumbnailCloudinary) {
    throw new ApiError(400, "Thumbnail file required!!!");
  }

  const video = await Video.create({
    title,
    descripition,
    duration: videoCloudinary.duration,
    videoFile: videoCloudinary?.url || "",
    public_id_video: videoCloudinary?.public_id || "",
    public_id_thumbnail: thumbnailCloudinary?.public_id || "",
    thumbnail: thumbnailCloudinary?.url || "",
    owner: userId
  });
  const uplVideo = await Video.findById(video._id);

  if (!uplVideo) {
    throw new ApiError(500, "Something went wrong while uploading video");
  }
  res
    .status(200)
    .json(new ApiResponse(200, uplVideo, "Video uploaded Succsefully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video Id is required");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Error while finding the video");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched Succesfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, descripition, thumbnail } = req.body;
  if (!videoId) {
    throw new ApiError(400, "Video Id is required");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Error while finding the video");
  }

if(video.owner.toString() === req.user._id.toString()){
    const thumbnailLocalPath = req.file?.path;
  if (thumbnailLocalPath) {
    const thumbnailCloudinary = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnailCloudinary) {
      throw new ApiError(404, "Error while uploding on cloudinary");
    }
    const oldThumbnailDelete = await deleteOldFilesOnCloudinary(
      video.public_id_thumbnail
    );
    if (!oldThumbnailDelete) {
      throw new ApiError(400, "Error while deletion old thumbnail");
    }
    video.thumbnail = thumbnailCloudinary.url;
    video.public_id_thumbnail = thumbnailCloudinary.public_id;
  }

  video.title = title;
  video.descripition = descripition;
  await video.save();
}
  return res
    .status(200)
    .json(new ApiResponse(200, "Video Updated Succesfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video does not Exists");
  }
  if(video.owner.toString() === req.user._id.toString()){
    const delResponseVideo = await deleteOldFilesOnCloudinary(
    video.public_id_video
  );
  const delResponsethumbnail = await deleteOldFilesOnCloudinary(
    video.public_id_thumbnail
  );
  const delVideo = await Video.deleteOne({"_id": video._id});
  if (!delVideo) {
    throw new ApiError(400, "Error while deleting Video in DataBase");
  }
  }
  
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted Succesfully"));
});

const toggolePublishStatus = asyncHandler(async(req,res)=>{
  const {videoId} = req.params
  if(!videoId){
    throw new ApiError(400,"Video Id is required")
  }
  const video = await Video.findById(videoId)
  if(!video){
    throw new ApiError(400,"Video Not Found")
  }
  video.isPublished = !video.isPublished 
  await video.save()
  return res
  .status(200)
  .json(new ApiResponse(200,"Published status toggoled succesfully"))
})

const getAllVideos = asyncHandler(async(req,res)=>{
  const {page=1,limit=10,query,sortBy,sortType} = req.query
  const {userId} = req.params
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
  throw new ApiError(400, "Invalid user ID");
}

 const userVideos = await Video.aggregate([
  {
    $match:{
      owner:new mongoose.Types.ObjectId(userId)
    }
  },
  {
    $lookup:{
      from:"users",
      localField:"owner",
      foreignField:"_id",
      as:"userDetails"
    }
  },
  {
    $addFields:{
      userDetails:{"$first":"$userDetails"}
    }
  },
  {
    $project:{
      thumbnail:1,
      owner:1,
      title:1,
      descripition:1,
      duration:1,
      "userDetails.username":1,
      "userDetails.email":1,
      "userDetails.fullname":1,
    }
  }
 ])
   return res
  .status(200)
  .json(new ApiResponse(200,userVideos,"Videos fetched succesfully"))
})

export { publishVideo, getVideoById, updateVideo, deleteVideo,toggolePublishStatus,getAllVideos };

import { Video } from "../models/video.module.js";
import { ApiError } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { Playlist } from "../models/playlist.module.js";
import { ApiResponse } from "../utils/apiresponse.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name.trim()) {
    throw new ApiError(400, "Name is required");
  }
  const playlist = await Playlist.create({
    name:name.trim(),
    description: description.trim() || "",
    videos: [],
    owner: req.user._id,
  });
  if (!playlist) {
    throw new ApiError(400, "Erro while creating playlist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created succesfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(400, "Playlist Id is Required");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "Playlist Not Found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched succesfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId) {
    throw new ApiError(400, "Playlist Id is Required");
  }
  if (!videoId) {
    throw new ApiError(400, "Video Id is Required");
  }
  const video = await Video.findById(videoId);
  const playlist = await Playlist.findById(playlistId);
  if (!video) {
    throw new ApiError(400, "Video Not Found");
  }
  if (!playlist) {
    throw new ApiError(400, "Playlist Not Found");
  }
  playlist.videos.push(video._id);
  await playlist.save();
  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video added to playlist succesfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId) {
    throw new ApiError(400, "Playlist Id is Required");
  }
  if (!videoId) {
    throw new ApiError(400, "Video Id is Required");
  }
  const video = await Video.findById(videoId);
  const playlist = await Playlist.findById(playlistId);
  if (!video) {
    throw new ApiError(400, "Video Not Found");
  }
  if (!playlist) {
    throw new ApiError(400, "Playlist Not Found");
  }
  if (!playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video Not Found In Playlist");
  }
  const cplaylist = playlist.videos.filter(
    (data) => data.toString() !== videoId.toString()
  );
  playlist.videos = cplaylist;
  await playlist.save();
  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video removed from playlist succesfully")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!name) {
    throw new ApiError(400, "Name is required");
  }
  if (!playlistId) {
    throw new ApiError(400, "Playlist ID is required");
  }
  const updateData = {name:name}
  if(description?.trim()){
    updateData.description = description.trim()
  }
  const playlist = await Playlist.findOneAndUpdate(
    {
        _id:playlistId,
        owner:req.user._id
    },
    {
      $set: {
        name: updateData.name,
        description:updateData.description
      },
    },
    {
      new: true,
    }
  );
  if (!playlist) {
    throw new ApiError(400, "Error while Updating Playlist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist Updated succesfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(400, "Playlist ID is required");
  }
  const playlist = await Playlist.findOneAndDelete(
    {
        _id:playlistId,
        owner:req.user._id
    }
  );
  if (!playlist) {
    throw new ApiError(400, "Error while Deleting Playlist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist Deleted succesfully"));
});

const getUserPlaylist = asyncHandler(async(req,res)=>{
  const {userId} = req.params
  if(!mongoose.Types.ObjectId.isValid(userId)){
    throw new ApiError(400,"Invalid user Id")
  }
  const usersPlaylist = await Playlist.aggregate([
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
        as:"ownerDetails"
      }
    },
    {
      $addFields:{
        ownerDetails:{"$first":"$ownerDetails"}
      }
    },
    {
      $project:{
        name:1,
        description:1,
        videos:1,
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
  .json(new ApiResponse(200,usersPlaylist,"User Playlist fetched succesfully"))
})
export {
  createPlaylist,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  updatePlaylist,
  deletePlaylist,
  getUserPlaylist
};

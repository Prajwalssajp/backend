// when you it endpoint means when you go to this url 
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import { User } from "../models/user.module.js";
import Cookies from "cookie-parser"
import {
  uploadOnCloudinary,
  deleteOldFilesOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiresponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // mongoose passeord is kickin password is required
    // console.log("Tokens generated:", accessToken, refreshToken);
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user alredy exit : unique usernme,email
  //check for images,check for avatar
  // upload them in cloudinary, avatar
  // create user object - creation entry in db
  // remove passwordd and refresh token field from response
  // checj for user creation
  // return res
  const { username, email, password, fullname } = req.body;
  console.log(username);

  if (
    [username, email, password, fullname].some(
      (fields) => fields?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  console.log(existedUser);

  if (existedUser) {
    throw new ApiError(409, "User with username or email is alredy exists");
  }
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0].path
  console.log(avatarLocalPath);

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files?.coverImage) &&
    req.files?.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log(avatar);

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }
  const user = await User.create({
    fullname,
    avatar: avatar?.url || "",
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registerd Successfully"));
});

const logInUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  // find the user
  // password check
  // access and referesh token
  // send tokens through cookies
  const { username, email, password } = req.body;
  // console.log(email);

  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User not registered");
  }

  const isPasswordValid = await user.isPasswordCorrect(password); // acces through user mongdb user instance this method created by me

  if (!isPasswordValid) {
    throw new ApiError(401, "Password is not correct");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  // console.log(loggedInUser);

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {
        user: loggedInUser,
        accessToken,
        refreshToken,
      }),
      "User logged in succesfully"
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken:1 // this removes the field from document
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out succesfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const inCommingRefreshToken = req?.cookies.refreshToken || req.body.refreshToken;
  if (!inCommingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }
  try {
    const decodedToken = jwt.verify(
      inCommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }
    if (inCommingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed succesfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh Token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
console.log(oldPassword);

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(401, "User Not Found");
  }
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed succesfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { currentUser: req.user },
        "current user fetched succesfully"
      )
    );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;
  if (!fullname || !email) {
    throw new ApiError(400, "Both fields are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email,
        // email:email
      },
    },
    {
      new: true, // return updating user
    }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account Details update succesfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req?.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }
  const newUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiError(200, { newUser }, "Avatar updated succesfully"));
});

const updateUserCoverimage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "cover Image  file is required");
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading cover image");
  }
  const newUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiError(200, { newUser }, "Cover Image Updated succesfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim) {
    throw new ApiError(400, "username is missing");
  }
  // User.find({username})
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscrbers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscibedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscrbers",
        },
        channelSubscribedToCount: {
          $size: "$subscibedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscrbers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new ApiError(404, "channel does not exit");
  }
  return res
    .status(202)
    .json(new ApiResponse(202, channel[0], "user channel fetched succesfully"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      }, // req.user_id is MongoDB ID 
    }, 
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [{
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [{
              $project: {
                fullname: 1,
                username: 1,
                avatar: 1,
              },
            },
          ]
          },
        },
        {
            $addFields:{
                owner:{
                    $first:"$owner"
                }
            }
        }
      ],
      },
    },
  ]);
  return res
  .status(200)
  .json(
    new ApiResponse(200,user[0].watchHistory,
        "watch history fetched"
    )
  )
});

export {
  logInUser,
  registerUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverimage,
  getUserChannelProfile,
  getWatchHistory,
};

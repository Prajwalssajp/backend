import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./apierror.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("file is uploaded on cloudinary", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the localy saved temporary file as the upload operation got failed
    return null;
  }
};
const deleteOldFilesOnCloudinary = async (cloudinaryPublicId) => {
  try {
    if (!cloudinaryPublicId) {
      throw new ApiError(400, "Public Id is required");
    }
    const result = await cloudinary.uploader.destroy(cloudinaryPublicId);
    if (result.result === "ok") {
      console.log(
        "File deleted successfully on Cloudinary:",
        cloudinaryPublicId
      );
      return result;
    } else if (result.result === "not found") {
      console.warn(" File not found on Cloudinary:", cloudinaryPublicId);
      return result;
    } else {
      console.error("Cloudinary deletion failed:", result);
      throw new ApiError(500, "Cloudinary deletion failed");
    }
  } catch (error) {
    console.log(error)
    throw new ApiError(500, "Error while delting the file on cloudinary");
  }
};
// cloudinary.v2.uploader.upload()
export { uploadOnCloudinary, deleteOldFilesOnCloudinary };

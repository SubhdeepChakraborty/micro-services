import { v2 as cloudinary } from 'cloudinary';
import logger from "../utils/logger.js"
import dotenv from "dotenv"

dotenv.config()

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_PUBLIC_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET, // Click 'View API Keys' above to copy your API secret
});


//Uploading file
const uploadMediaFileToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          logger.error("Error while uploading media to cloudinary", error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(file.buffer)
  });
};

export default uploadMediaFileToCloudinary
import dotenv  from "dotenv";

dotenv.config({
    path: "./.env"
});

import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    if(!localFilePath) return null;

    const fixedPath = localFilePath.replace(/\\/g, "/");

    try {
        const response = await cloudinary.uploader.upload(fixedPath, {resource_type: "auto"})

        fs.unlinkSync(localFilePath);
        return response.url;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null
    }
}

export default uploadOnCloudinary;
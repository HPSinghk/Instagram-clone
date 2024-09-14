import {v2 as cloudinary} from  'cloudinary';
import dotenv from  'dotenv';
import fs from 'fs';

dotenv.config({})

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const uploadOnCloudinary = async(localfilePath) => {
    try {
        if(!localfilePath) {  return null; }
        const file = await cloudinary.uploader.upload(localfilePath, {
            resource_type: 'auto',           
        }) 
        fs.unlinkSync(localfilePath)
        return file;
    } catch (error) {
        fs.unlinkSync(localfilePath)
        console.log("error while uploading cloudinary:",error)
    }
}

export default  uploadOnCloudinary;




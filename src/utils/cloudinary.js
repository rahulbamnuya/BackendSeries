import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { log } from 'console';
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const UploadOnCloudinary=async (filepath)=>{
    try{
        if(!filepath){
            return null
        }
        const response= await cloudinary.uploader.upload(filepath, {
            resource_type: "auto",
        })
        //filepath is the path to the image file
        // console.log("Uploading image to Cloudinary...",response.url);
         fs.unlinkSync(filepath);
        return response;
    }catch(err){
        fs.unlinkSync(filepath); //delete the file if upload fails
        console.error("Error uploading image to Cloudinary:", err);

    }
}
export { UploadOnCloudinary };
// cloudinary.v2.uploader.upload("/home/my_image.jpg",
//      {public_id: "olympic_flag"}, function (error, result){
//   console.log(result, error);
// });
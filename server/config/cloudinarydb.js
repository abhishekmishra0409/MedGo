const cloudinary = require("cloudinary").v2;

const cloudinaryConfig = () =>{
    try{ cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET
    });
        console.log("Connected with cloudinary");
    }catch(error){
        console.log("Error in connection with cloudinary");
    }
}

module.exports = cloudinaryConfig;
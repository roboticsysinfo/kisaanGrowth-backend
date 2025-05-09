const ImageKit = require("../utils/imagekit")

const uploadToImageKit = async (fileBuffer, fileName, folder = "blogs") => {

  try {
    const result = await ImageKit.upload({
      file: fileBuffer, // buffer
      fileName: fileName, // originalname
      folder: folder,
    });
    return result; // contains .url, .fileId, etc.
  } catch (error) {
    throw new Error("Image upload failed: " + error.message);
  }
  
};

module.exports = uploadToImageKit;

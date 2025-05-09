// middlewares/upload.js

const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  const isMimeTypeValid = allowedMimeTypes.includes(file.mimetype);

  const extname = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = [".jpeg", ".jpg", ".png", ".gif", ".webp"];
  const isExtNameValid = allowedExtensions.includes(extname);

  if (isMimeTypeValid && isExtNameValid) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed."));
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;

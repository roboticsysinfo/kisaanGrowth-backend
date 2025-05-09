// config/aadharUpload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Disk storage config for Aadhar Card
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "/uploads";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `aadhar-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

const uploadAadhar = multer({ storage });

module.exports = uploadAadhar;

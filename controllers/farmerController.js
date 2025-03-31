const Farmer = require("../models/Farmer");
const generateToken = require("../utils/jwtGenerator");
const multer = require('multer')
const path = require('path');


// Define storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Ensure unique filenames
  },
});

// Filter to only allow specific file types (optional)
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png/; // Adjust for the file types you need
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);
  
  if (extName && mimeType) {
    return cb(null, true);
  }
  cb(new Error('Invalid file type. Only JPG, JPEG, and PNG are allowed.'));
};

// Initialize multer with storage and file filter options
const upload = multer({ storage, fileFilter });

// Farmer Registration Controller

const registerFarmer = async (req, res) => {
  const { name, email, password, phoneNumber, address, aadharCard } = req.body;
  const uploadAadharCard = req.file ? req.file.path : undefined;

  try {
    if (!name || !email || !password || !phoneNumber || !address || !aadharCard || !uploadAadharCard) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingFarmer = await Farmer.findOne({
      $or: [{ email }, { aadharCard }],
    });

    if (existingFarmer) {
      const duplicateField = existingFarmer.email === email ? "Email" : "Aadhar Card";
      return res.status(409).json({ message: `${duplicateField} already exists` });
    }

    const newFarmer = new Farmer({
      name,
      email,
      password, // Password will be hashed automatically
      phoneNumber,
      address,
      aadharCard,
      isKYCVerified: false, // Default
      kycRequested: true, // Automatically request KYC
      uploadAadharCard,  // Ensure file path is set correctly
    });

    await newFarmer.save();

    res.status(201).json({
      message: "Farmer registered successfully. KYC request has been sent.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error occurred",
      error: error.message,
    });
  }
};


// Farmer Login
const farmerLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find farmer by email
    const farmer = await Farmer.findOne({ email });
    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    // Check if the farmer is KYC verified
    if (!farmer.isKYCVerified) {
      return res.status(403).json({ message: "Your KYC is not verified yet" });
    }

    // Validate password using the comparePassword method on the farmer instance
    const isPasswordValid = await farmer.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token using your utility function
    const token = generateToken(farmer._id, 'farmer'); // Pass the farmer's _id and role

    res.status(200).json({
      message: "Farmer login successful",
      token,
      farmer: {
        id: farmer._id,
        name: farmer.name,
        email: farmer.email,
        role: 'farmer', // Ensure the role is included here
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Request KYC verification
const requestKYC = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.user.id);

    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    // If KYC is already verified or KYC request is already sent
    if (farmer.isKYCVerified || farmer.kycRequested) {
      return res.status(400).json({ message: "KYC verification already requested or verified" });
    }

    // Set kycRequested to true
    farmer.kycRequested = true;
    await farmer.save();

    res.status(200).json({ message: "KYC verification request sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const getAllFarmers = async (req, res) => {
  try {
    const farmers = await Farmer.find({}, '-password'); // Exclude password field
    res.status(200).json(farmers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const sendOTPToFarmer = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Check if farmer exists
    const farmer = await Farmer.findOne({ phoneNumber });
    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    // Fixed Dummy OTP
    const otp = "1234";

    // Normally, you would send OTP via SMS here
    res.status(200).json({ message: "OTP sent successfully", otp });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }

};

const farmerLoginWithOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  try {
    if (!phoneNumber || !otp) {
      return res.status(400).json({ message: "Phone number and OTP are required" });
    }

    // Dummy OTP check
    if (otp !== "1234") {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // Find farmer by phone number
    const farmer = await Farmer.findOne({ phoneNumber });
    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    // Check if the farmer is KYC verified
    if (!farmer.isKYCVerified) {
      return res.status(403).json({ message: "Your KYC is not verified yet" });
    }

    // Generate JWT token
    const token = generateToken(farmer._id, "farmer");

    res.status(200).json({
      message: "Farmer login successful",
      token,
      farmer: {
        id: farmer._id,
        name: farmer.name,
        phoneNumber: farmer.phoneNumber,
        role: "farmer",
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



module.exports = { 
  registerFarmer, 
  farmerLogin, 
  requestKYC, 
  getAllFarmers, 
  upload ,
  farmerLoginWithOTP,
  sendOTPToFarmer 
};

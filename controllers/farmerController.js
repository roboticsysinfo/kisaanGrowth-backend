const Farmer = require("../models/Farmer");
const generateToken = require("../utils/jwtGenerator");


// Farmer Registration Controller
const registerFarmer = async (req, res) => {
  const { name, email, password, phoneNumber, address, aadharCard } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !password || !phoneNumber || !address || !aadharCard) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicate email or Aadhar
    const existingFarmer = await Farmer.findOne({
      $or: [{ email }, { aadharCard }],
    });

    if (existingFarmer) {
      const duplicateField = existingFarmer.email === email ? "Email" : "Aadhar Card";
      return res.status(409).json({ message: `${duplicateField} already exists` });
    }

    // Create a new Farmer
    const newFarmer = new Farmer({
      name,
      email,
      password, // Password will be hashed automatically
      phoneNumber,
      address,
      aadharCard,
      isKYCVerified: false, // Default
      kycRequested: true, // Automatically request KYC
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
      user: {
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

module.exports = { registerFarmer, farmerLogin, requestKYC };

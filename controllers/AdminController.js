const Admin = require('../models/Admin');
const Farmer = require("../models/Farmer");
const generateToken = require('../utils/jwtGenerator');

// Register Admin
const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = new Admin({ name, email, password });
    await admin.save();

    res.status(201).json({ message: 'Admin registered successfully', admin });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Login Admin
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(admin._id, 'admin');
    res.status(200).json({ message: 'Login successful', token, admin });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// Approve KYC verification
const approveKYC = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.farmerId);

    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    // Approve KYC and set the field to true
    farmer.isKYCVerified = true;
    farmer.kycRequested = false; // Reset the request status
    await farmer.save();

    res.status(200).json({ message: "KYC verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Reject KYC verification
const rejectKYC = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.farmerId);

    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    // Reject KYC and reset the request status
    farmer.kycRequested = false;
    await farmer.save();

    res.status(200).json({ message: "KYC rejected" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getKYCRequests = async (req, res) => {
  try {
    const farmers = await Farmer.find({ kycRequested: true });

    if (farmers.length === 0) {
      return res.status(404).json({ message: "No KYC requests found" });
    }

    res.status(200).json({ farmers });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { registerAdmin, loginAdmin, approveKYC, rejectKYC, getKYCRequests };

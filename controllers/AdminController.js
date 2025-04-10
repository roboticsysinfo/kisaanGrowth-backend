const Admin = require('../models/Admin');
const Farmer = require("../models/Farmer");
const pointsTransactionHistory = require('../models/pointsTransactionHistory');
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

const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password"); // Include role field
    res.status(200).json({ admins });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch admins", error: error.message });
  }
};


// Approve KYC verification
// const approveKYC = async (req, res) => {

//   try {

//     const farmer = await Farmer.findById(req.params.id);

//     if (!farmer) {
//       return res.status(404).json({ message: "Farmer not found" });
//     }

//     farmer.isKYCVerified = true;
//     farmer.kycRequested = false;
//     await farmer.save();

//     res.status(200).json({ message: "KYC verified successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }

// };


const approveKYC = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);

    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    if (farmer.isKYCVerified) {
      return res.status(400).json({ message: "Farmer is already KYC verified" });
    }

    farmer.isKYCVerified = true;
    farmer.kycRequested = false;

    // Referral Logic
    if (farmer.referredBy) {
      const referrer = await Farmer.findById(farmer.referredBy);

      if (referrer) {
        const referralPoints = 5;

        referrer.points = (referrer.points || 0) + referralPoints;
        referrer.referralDownloads += 1;

        farmer.points = (farmer.points || 0) + referralPoints;

        await referrer.save();

        // Create Points Transaction for Referrer
        await pointsTransactionHistory.create({
          farmer: referrer._id,
          points: referralPoints,
          type: "referral",
          description: `Referral bonus for referring ${farmer.name}`,
        });

        // Create Points Transaction for Referred Farmer
        await pointsTransactionHistory.create({
          farmer: farmer._id,
          points: referralPoints,
          type: "referral",
          description: "Bonus for joining with referral code",
        });
      }
    }

    await farmer.save();

    res.status(200).json({ message: "KYC verified successfully. Referral points updated if applicable." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



const deleteAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    await admin.remove(); // Remove the admin from the database

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete admin", error: error.message });
  }
};


const updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  try {
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Update the fields if provided
    admin.name = name || admin.name;
    admin.email = email || admin.email;

    // If a new password is provided, hash and update it
    if (password) {
      const bcrypt = require("bcryptjs");
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password, salt);
    }

    await admin.save(); // Save the updated admin

    res.status(200).json({ message: "Admin updated successfully", admin });
  } catch (error) {
    res.status(500).json({ message: "Failed to update admin", error: error.message });
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

module.exports = {
  registerAdmin,
  loginAdmin,
  approveKYC,
  rejectKYC,
  getKYCRequests,
  getAllAdmins,
  deleteAdmin,
  updateAdmin
};

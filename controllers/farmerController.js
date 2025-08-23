const Farmer = require("../models/Farmer");
const Shop = require("../models/Shop");
const PointTransaction = require("../models/pointsTransactionHistory");
const generateToken = require("../utils/jwtGenerator");
const { ObjectId } = require('mongodb');
const axios = require("axios");
require('dotenv').config();
const FarmerOTPModel = require("../models/FarmerOTPModel");
const imagekit = require("../utils/imagekit");
const fs = require("fs");
const FarmerRedeemBill = require("../models/FarmerRedeemBill");
const { log } = require("console");


// 🔐 Helper to generate referral code like "KG123456"
const generateReferralCode = () => {
  const randomNumber = Math.floor(100000 + Math.random() * 900000); // ensures a 6-digit number
  return `KG${randomNumber}`;
};

// Farmer Registration Controller
const registerFarmer = async (req, res) => {
  const {
    name,
    email,
    password,
    phoneNumber,
    address,
    aadharCard,
    referralCode,
    state,
    city_district,
    village,
    agreedToPrivacyPolicyAndTermsAndConditions,
    agreementTimestamp
  } = req.body;

  const uploadAadharCard = req.file?.path;

  try {

    if (!name || !email || !password || !phoneNumber || !address || !aadharCard || !uploadAadharCard || !state || !city_district) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const existingFarmer = await Farmer.findOne({
      $or: [{ email }, { aadharCard }, { phoneNumber }],
    });

    if (existingFarmer) {

      let duplicateField = '';
      if (existingFarmer.email === email) duplicateField = "Email";
      else if (existingFarmer.aadharCard === aadharCard) duplicateField = "Aadhar Card";
      else if (existingFarmer.phoneNumber === phoneNumber) duplicateField = "Phone Number";

      return res.status(409).json({ message: `${duplicateField} already exists` });

    }

    let referringFarmer = null;

    if (referralCode) {
      referringFarmer = await Farmer.findOne({ referralCode });
      if (!referringFarmer) {
        return res.status(400).json({ message: "Invalid referral code" });
      }
    }

    const newFarmer = new Farmer({
      name,
      email,
      password,
      phoneNumber,
      address,
      aadharCard,
      uploadAadharCard,
      state,
      city_district,
      village,
      isKYCVerified: false,
      kycRequested: true,
      referralCode: generateReferralCode(),
      referredBy: referringFarmer ? referringFarmer._id : null,
      points: 0,
      agreedToPrivacyPolicyAndTermsAndConditions,
      agreementTimestamp,
    });

    await newFarmer.save();

    if (!referringFarmer) {
      const selfRegisterPoints = 10;
      newFarmer.points += selfRegisterPoints;
      await newFarmer.save();

      await PointTransaction.create({
        farmer: newFarmer._id,
        points: selfRegisterPoints,
        type: "self_register",
        description: "Points awarded for signing up without referral",
      });
    }

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


// const registerFarmer = async (req, res) => {
//   const {
//     name,
//     email,
//     password,
//     phoneNumber,
//     address,
//     aadharCard,
//     referralCode,
//     state,
//     city_district,
//     village,
//     agreedToPrivacyPolicyAndTermsAndConditions, 
//     agreementTimestamp
//   } = req.body;

//   const uploadAadharCard = req.files?.uploadAadharCard?.[0]?.path;
//   const profileImg = req.files?.profileImg?.[0]?.path || "https://avatar.iran.liara.run/public";

//   try {
//     if (!name || !email || !password || !phoneNumber || !address || !aadharCard || !uploadAadharCard || !state || !city_district) {
//       return res.status(400).json({ message: "Required fields are missing" });
//     }

//     const existingFarmer = await Farmer.findOne({
//       $or: [
//         { email },
//         { aadharCard },
//         { phoneNumber }
//       ],
//     });

//     if (existingFarmer) {
//       let duplicateField = '';
//       if (existingFarmer.email === email) duplicateField = "Email";
//       else if (existingFarmer.aadharCard === aadharCard) duplicateField = "Aadhar Card";
//       else if (existingFarmer.phoneNumber === phoneNumber) duplicateField = "Phone Number";

//       return res.status(409).json({ message: `${duplicateField} already exists` });
//     }

//     let referringFarmer = null;
//     if (referralCode) {
//       referringFarmer = await Farmer.findOne({ referralCode });
//       if (!referringFarmer) {
//         return res.status(400).json({ message: "Invalid referral code" });
//       }
//     }

//     const newFarmer = new Farmer({
//       name,
//       email,
//       password,
//       phoneNumber,
//       address,
//       aadharCard,
//       uploadAadharCard,
//       profileImg,
//       state,
//       city_district,
//       village,
//       isKYCVerified: false,
//       kycRequested: true,
//       referralCode: generateReferralCode(),
//       referredBy: referringFarmer ? referringFarmer._id : null,
//       points: 0,
//       agreedToPrivacyPolicyAndTermsAndConditions, 
//       agreementTimestamp
//     });

//     await newFarmer.save();

//     if (!referringFarmer) {
//       const selfRegisterPoints = 10;
//       newFarmer.points += selfRegisterPoints;
//       await newFarmer.save();

//       await PointTransaction.create({
//         farmer: newFarmer._id,
//         points: selfRegisterPoints,
//         type: "self_register",
//         description: "Points awarded for signing up without referral",
//       });
//     }

//     res.status(201).json({
//       message: "Farmer registered successfully. KYC request has been sent.",
//     });

//   } catch (error) {
//     res.status(500).json({
//       message: "Server error occurred",
//       error: error.message,
//     });
//   }
// };


const getFarmerById = async (req, res) => {

  try {

    const farmerId = req.user._id;

    // Find farmer by ID and exclude password
    const farmer = await Farmer.findById(farmerId).select("-password");

    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    res.status(200).json(farmer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }

};


// For admin: get farmer by ID from params
const getFarmerByIdForAdmin = async (req, res) => {
  try {

    const farmerId = req.params.farmerId;

    const farmer = await Farmer.findById(farmerId).select("-password");
    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    res.status(200).json(farmer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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


const updateFarmerById = async (req, res) => {

  try {

    const farmerId = req.params.farmerId;
    const updates = req.body;

    // Handle profile image upload via ImageKit
    if (req.file) {

      // Directly using the buffer from memory storage (no need for fs.readFileSync)
      const fileBuffer = req.file.buffer;

      const uploadResponse = await imagekit.upload({
        file: fileBuffer, // required
        fileName: req.file.originalname, // required
        folder: "/uploads", // optional
      });

      // Set the profileImg field in the updates
      updates.profileImg = uploadResponse.url;

    }

    // Update the farmer in the database with the new details
    const updatedFarmer = await Farmer.findByIdAndUpdate(
      farmerId,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedFarmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    res.status(200).json({
      message: "Farmer updated successfully",
      farmer: updatedFarmer,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteFarmerById = async (req, res) => {
  try {
    const { farmerId } = req.params;

    const deletedFarmer = await Farmer.findByIdAndDelete(farmerId);

    if (!deletedFarmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Farmer deleted successfully",
      data: deletedFarmer,
    });
  } catch (error) {
    console.error("Delete farmer error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting farmer",
      error: error.message,
    });
  }
};


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

// const getAllFarmers = async (req, res) => {

//   try {
//     const farmers = await Farmer.find({}, '-password')
//       .populate({
//         path: 'referredBy',
//         select: 'name',
//       });

//     res.status(200).json(farmers);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }

// };


const getAllFarmers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const query = {
      name: { $regex: search, $options: 'i' },
    };

    const total = await Farmer.countDocuments(query);

    const farmers = await Farmer.find(query, '-password')
      .populate({
        path: 'referredBy',
        select: 'name',
      })
      .sort({ createdAt: -1 }) // ✅ Sort by newest first
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      farmers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// real otp function - fast 2 sms

// const sendOTPToFarmer = async (req, res) => {

//   const { phoneNumber } = req.body;

//   try {
//     if (!phoneNumber) {
//       return res.status(400).json({ message: "Phone number is required" });
//     }

//     // Check if farmer exists
//     const farmer = await Farmer.findOne({ phoneNumber });
//     if (!farmer) {
//       return res.status(404).json({ message: "Farmer not found" });
//     }

//     // Generate random 4-digit OTP
//     const otp = Math.floor(1000 + Math.random() * 9000).toString();

//     // Save OTP with 1 minute expiry
//     const expiresAt = new Date(Date.now() + 60 * 1000); // 1 min later
//     await FarmerOTPModel.create({ phone: phoneNumber, otp, expiresAt });

//     // Send OTP via Fast2SMS
//     const fast2smsRes = await axios.post(
//       "https://www.fast2sms.com/dev/bulkV2",
//       {
//         route: "dlt",
//         sender_id: "KSGROW", //  approved sender ID
//         message: "185274",   // approved DLT Template ID
//         variables_values: otp,
//         numbers: phoneNumber,
//       },
//       {
//         headers: {
//           authorization: process.env.FAST2SMS_API_KEY,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     res.status(200).json({
//       message: "OTP sent successfully",
//       isKYCVerified: farmer.isKYCVerified,
//     });
//   } catch (error) {
//     console.error("Farmer OTP Send Error:", error.message);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// Verify OTP Fast 2 sms

// const farmerLoginWithOTP = async (req, res) => {
//   const { phoneNumber, otp } = req.body;

//   try {
//     if (!phoneNumber || !otp) {
//       return res.status(400).json({ message: "Phone number and OTP are required" });
//     }

//     // Find latest OTP
//     const latestOtp = await FarmerOTPModel.findOne({ phone: phoneNumber }).sort({ createdAt: -1 });

//     if (
//       !latestOtp ||
//       latestOtp.otp !== otp ||
//       new Date(latestOtp.expiresAt) < new Date()
//     ) {
//       return res.status(401).json({ message: "Invalid or expired OTP" });
//     }

//     // OTP is valid — delete it
//     await FarmerOTPModel.deleteMany({ phone: phoneNumber });

//     const farmer = await Farmer.findOne({ phoneNumber });
//     if (!farmer) {
//       return res.status(404).json({ message: "Farmer not found" });
//     }

//     if (!farmer.isKYCVerified) {
//       return res.status(403).json({ message: "Your KYC is not verified yet" });
//     }

//     // ✅ Daily Login Logic
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const alreadyGiven = await PointTransaction.findOne({
//       farmer: farmer._id,
//       type: "daily_login",
//       createdAt: { $gte: today },
//     });

//     if (!alreadyGiven) {
//       const points = 1;
//       farmer.points += points;
//       await farmer.save();

//       await PointTransaction.create({
//         farmer: farmer._id,
//         points,
//         type: "daily_login",
//         description: "Daily login reward",
//       });
//     }

//     // Generate JWT token
//     const token = generateToken(farmer._id, "farmer");

//     res.status(200).json({
//       message: "Farmer login successful",
//       token,
//       farmer: {
//         id: farmer._id,
//         name: farmer.name,
//         phoneNumber: farmer.phoneNumber,
//         role: "farmer",
//         points: farmer.points,
//       },
//     });
//   } catch (error) {
//     console.error("Farmer OTP Login Error:", error.message);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };


// ------------------------------------------

// Test/Review phone numbers (App Access play store)
const reviewNumbers = ["1122334455", "9876543210"]; // <-- change to your reviewer numbers

// Real OTP function - Fast2SMS
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

    let otp;
    if (reviewNumbers.includes(phoneNumber)) {
      // ✅ Review Mode - fixed OTP
      otp = "1234";
      // console.log(`📢 Review Mode OTP for ${phoneNumber}: ${otp}`);
    } else {
      // ✅ Real OTP
      otp = Math.floor(1000 + Math.random() * 9000).toString();

      // Send OTP via Fast2SMS
      await axios.post(
        "https://www.fast2sms.com/dev/bulkV2",
        {
          route: "dlt",
          sender_id: "KSGROW",
          message: "185274",
          variables_values: otp,
          numbers: phoneNumber,
        },
        {
          headers: {
            authorization: process.env.FAST2SMS_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Save OTP with 1 minute expiry
    const expiresAt = new Date(Date.now() + 60 * 1000);
    await FarmerOTPModel.create({ phone: phoneNumber, otp, expiresAt });

    res.status(200).json({
      message: reviewNumbers.includes(phoneNumber)
        ? "Review mode: OTP fixed to 1234"
        : "OTP sent successfully",
      isKYCVerified: farmer.isKYCVerified,
    });
  } catch (error) {
    console.error("Farmer OTP Send Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Verify OTP
const farmerLoginWithOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  try {
    if (!phoneNumber || !otp) {
      return res
        .status(400)
        .json({ message: "Phone number and OTP are required" });
    }

    // Find latest OTP
    const latestOtp = await FarmerOTPModel.findOne({ phone: phoneNumber }).sort({ createdAt: -1 });

    if (
      !latestOtp ||
      latestOtp.otp !== otp ||
      new Date(latestOtp.expiresAt) < new Date()
    ) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    // OTP is valid — delete it
    await FarmerOTPModel.deleteMany({ phone: phoneNumber });

    const farmer = await Farmer.findOne({ phoneNumber });
    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    if (!farmer.isKYCVerified) {
      return res
        .status(403)
        .json({ message: "Your KYC is not verified yet" });
    }

    // ✅ Daily Login Logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyGiven = await PointTransaction.findOne({
      farmer: farmer._id,
      type: "daily_login",
      createdAt: { $gte: today },
    });

    if (!alreadyGiven) {
      const points = 1;
      farmer.points += points;
      await farmer.save();

      await PointTransaction.create({
        farmer: farmer._id,
        points,
        type: "daily_login",
        description: "Daily login reward",
      });
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
        points: farmer.points,
      },
    });
  } catch (error) {
    console.error("Farmer OTP Login Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ------------------------------------------------

// Daily 5 min stay reward points function

const rewardDailyPoints = async (req, res) => {
  const farmerId = req.user.id; // assuming auth middleware adds user info

  try {
    const farmer = await Farmer.findById(farmerId);
    const today = new Date().toDateString();

    if (farmer.lastRewardDate?.toDateString() === today) {
      return res.status(400).json({ message: "Already rewarded today" });
    }

    const rewardPoints = 5;

    farmer.points += rewardPoints;
    farmer.lastRewardDate = new Date();

    await farmer.save();

    // ✅ Create points transaction
    await PointTransaction.create({
      farmer: farmer._id,
      points: rewardPoints,
      type: "daily_stay",
      description: "Daily login reward",
    });

    res.json({ message: "5 points rewarded", points: farmer.points });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// Farmer Refer Share Detail Count ( How Many Share Farmer did )

const incrementReferralShare = async (req, res) => {
  try {
    const { farmerId } = req.body;
    const farmer = await Farmer.findById(farmerId);
    if (!farmer) return res.status(404).json({ message: "Farmer not found" });

    const today = new Date().toDateString(); // only date part
    const lastShareDate = farmer.lastReferralShareDate ? new Date(farmer.lastReferralShareDate).toDateString() : null;

    if (lastShareDate === today) {
      // Same day
      if (farmer.todayReferralShareCount >= 3) {
        return res.status(200).json({ message: "Daily share limit reached. Try again tomorrow." });
      }
      farmer.todayReferralShareCount += 1;
    } else {
      // New day
      farmer.todayReferralShareCount = 1;
      farmer.lastReferralShareDate = new Date();
    }

    farmer.referralShares += 1;
    farmer.points += 1;

    await farmer.save();

    // ✅ Add transaction history
    await PointTransaction.create({
      farmer: farmer._id,
      points: 1,
      type: "daily_share",
      description: "Points awarded for sharing referral code"
    });

    res.status(200).json({
      message: "Referral share counted & points added",
      points: farmer.points,
      todayShareCount: farmer.todayReferralShareCount
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Get Referral Details of Single Farmer


const getFarmerReferralDetails = async (req, res) => {
  try {
    const farmerId = req.params.id;

    // 1. Find the main farmer
    const farmer = await Farmer.findById(farmerId).lean();
    if (!farmer) return res.status(404).json({ message: "Farmer not found" });

    // 2. Find all referred farmers
    const referredFarmersRaw = await Farmer.find({ referredBy: farmerId })
      .select("name referralCode createdAt")
      .lean();

    // 3. Format referred farmers data with date + time
    const referredFarmers = referredFarmersRaw.map(f => ({
      name: f.name,
      referralCode: f.referralCode,
      createdAt: f.createdAt,
      createdAtFormatted: new Date(f.createdAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })
    }));

    // 4. Prepare and send response
    res.status(200).json({
      referralCode: farmer.referralCode,
      referralShares: farmer.referralShares,
      referralDownloads: farmer.referralDownloads,
      referredFarmers: referredFarmers,
    });
  } catch (error) {
    console.error("Error fetching referral details:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// farmer points transactions

const getPointTransactions = async (req, res) => {

  try {
    const { farmerId } = req.params;

    const transactions = await PointTransaction.find({ farmer: farmerId }).sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch point transactions", error });
  }

};


// Get Farmers by City/District
const getFarmersByCity = async (req, res) => {

  const { city_district } = req.query;

  if (!city_district) {
    return res.status(400).json({ message: 'city_district query is required' });
  }

  try {
    const farmers = await Farmer.find({ city_district });
    res.status(200).json(farmers);
  } catch (error) {
    console.error('Error fetching farmers by city:', error);
    res.status(500).json({ message: 'Server error while fetching farmers' });
  }
};


const getFarmerDetailsById = async (req, res) => {

  try {
    const farmerId = req.params.farmerId;

    // 1. Find farmer
    const farmer = await Farmer.findById(farmerId).select("-password");
    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    // 2. Find shop based on farmer_id
    const shop = await Shop.findOne({ farmer_id: farmerId });


    // 3. Return both farmer and shop
    res.status(200).json({
      ...farmer._doc,
      shop,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }

};


// Controller to update farmer's points after payment
const upgradeFarmerPoints = async (req, res) => {

  try {
    const { upgradedpoints, paymentId, paymentStatus } = req.body;
    const { farmerId } = req.params;

    if (!upgradedpoints || !farmerId) {
      return res.status(400).json({ success: false, message: 'Points and farmerId are required' });
    }

    const updatedFarmer = await Farmer.findByIdAndUpdate(
      farmerId,
      { $inc: { points: upgradedpoints } },
      { new: true }
    );

    if (!updatedFarmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    await PointTransaction.create({
      farmer: farmerId,
      points: upgradedpoints,
      type: "points_upgrade",
      description: `Congratulations! 🎉 Your points have been upgraded by ${upgradedpoints} points.`,
      paymentId: paymentId || null,
      paymentStatus: paymentStatus || 'success'
    });

    return res.status(200).json({
      success: true,
      message: 'Points updated successfully',
      updatedPoints: updatedFarmer.points
    });

  } catch (error) {
    console.error("Error in upgradeFarmerPoints:", error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


const getFarmerInvoiceByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const trimmedOrderId = orderId.trim();

    const bill = await FarmerRedeemBill.findOne({ orderId: trimmedOrderId })
      .populate('farmerId')
      .populate('redeemProductId');

    if (!bill) {
      console.log("❌ No bill found for Order ID:", trimmedOrderId);
      return res.status(404).json({ message: 'No bill found for this order ID' });
    }

    const farmer = bill.farmerId;

    const response = {
      invoice: {
        orderId: bill.orderId,
        billGeneratedAt: bill.billGeneratedAt,
        productName: bill.productName,
        priceValue: bill.priceValue,
        gstAmount: bill.gstAmount,
        totalAmount: bill.totalAmount,
        pdfPath: bill.pdfPath || null,
      },
      farmer: {
        id: farmer._id,
        name: farmer.name,
        phoneNumber: farmer.phoneNumber,
        email: farmer.email,
        state: farmer.state,
        city_district: farmer.city_district,
        village: farmer.village,
        address: farmer.address,
        registrationNumber: farmer.registrationNumber,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching invoice by orderId:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const getFarmerLeaderboard = async (req, res) => {
  try {
    const currentUserId = req.params.currentUserId; 
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    // ✅ Base + Search Query
    const searchQuery = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    // ✅ Get all farmers sorted (for ranking)
    const allFarmers = await Farmer.find({}, { name: 1, profileImg: 1, city_district: 1, state: 1, points: 1 })
      .sort({ points: -1 });

    // ✅ Assign unique rank based on index
    const rankedFarmers = allFarmers.map((farmer, index) => ({
      ...farmer.toObject(),
      rank: index + 1, // row_number style
    }));

    // ✅ Apply search + pagination after ranking
    const filtered = rankedFarmers.filter(f =>
      f.name.toLowerCase().includes(search.toLowerCase())
    );

    const paginated = filtered.slice(skip, skip + limit);

    // ✅ Current user rank
    let currentUserRank = null;
    if (currentUserId) {
      const userRankObj = rankedFarmers.find(f => f._id.toString() === currentUserId);
      currentUserRank = userRankObj ? userRankObj.rank : null;
    }

    res.status(200).json({
      success: true,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
      totalFarmers: filtered.length,
      currentUserRank,
      data: paginated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching leaderboard",
      error: error.message,
    });
  }
};



// mock otp 123

// const sendOTPToFarmer = async (req, res) => {
//   const { phoneNumber } = req.body;

//   try {

//     if (!phoneNumber) {
//       return res.status(400).json({ message: "Phone number is required" });
//     }

//     // Check if farmer exists
//     const farmer = await Farmer.findOne({ phoneNumber });
//     if (!farmer) {
//       return res.status(404).json({ message: "Farmer not found" });
//     }

//     // Fixed Dummy OTP
//     const otp = "1234";

//     // Normally, you would send OTP via SMS here
//     res.status(200).json({
//       message: "OTP sent successfully",
//       otp,
//       isKYCVerified: farmer.isKYCVerified,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }

// };

// const farmerLoginWithOTP = async (req, res) => {
//   const { phoneNumber, otp } = req.body;

//   try {
//     if (!phoneNumber || !otp) {
//       return res.status(400).json({ message: "Phone number and OTP are required" });
//     }

//     // Dummy OTP check
//     if (otp !== "1234") {
//       return res.status(401).json({ message: "Invalid OTP" });
//     }

//     const farmer = await Farmer.findOne({ phoneNumber });
//     if (!farmer) {
//       return res.status(404).json({ message: "Farmer not found" });
//     }

//     if (!farmer.isKYCVerified) {
//       return res.status(403).json({ message: "Your KYC is not verified yet" });
//     }

//     // ✅ Daily Login Logic
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const alreadyGiven = await PointTransaction.findOne({
//       farmer: farmer._id,
//       type: "daily_login",
//       createdAt: { $gte: today },
//     });

//     if (!alreadyGiven) {
//       const points = 1;
//       farmer.points += points;
//       await farmer.save();

//       await PointTransaction.create({
//         farmer: farmer._id,
//         points,
//         type: "daily_login",
//         description: "Daily login reward",
//       });
//     }

//     // Token generate
//     const token = generateToken(farmer._id, "farmer");

//     res.status(200).json({
//       message: "Farmer login successful",
//       token,
//       farmer: {
//         id: farmer._id,
//         name: farmer.name,
//         phoneNumber: farmer.phoneNumber,
//         role: "farmer",
//         points: farmer.points, // optional: frontend ko current points bhejne ke liye

//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

module.exports = {
  registerFarmer,
  farmerLogin,
  requestKYC,
  getAllFarmers,
  getFarmerById,
  updateFarmerById,
  deleteFarmerById,
  farmerLoginWithOTP,
  sendOTPToFarmer,
  rewardDailyPoints,
  incrementReferralShare,
  getFarmerReferralDetails,
  getPointTransactions,
  getFarmerByIdForAdmin,
  getFarmersByCity,
  getFarmerDetailsById,
  upgradeFarmerPoints,
  getFarmerInvoiceByOrderId,
  getFarmerLeaderboard
};

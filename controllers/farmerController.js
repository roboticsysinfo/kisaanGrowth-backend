const Farmer = require("../models/Farmer");
const PointTransaction = require("../models/pointsTransactionHistory");
const generateToken = require("../utils/jwtGenerator");


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
    village
  } = req.body;

  const uploadAadharCard = req.files?.uploadAadharCard?.[0]?.path;
  const profileImg = req.files?.profileImg?.[0]?.path || "https://avatar.iran.liara.run/public";

  try {
    if (!name || !email || !password || !phoneNumber || !address || !aadharCard || !uploadAadharCard || !state || !city_district) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const existingFarmer = await Farmer.findOne({
      $or: [
        { email },
        { aadharCard },
        { phoneNumber }
      ],
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
      profileImg,
      state,
      city_district,
      village,
      isKYCVerified: false,
      kycRequested: true,
      referralCode: generateReferralCode(),
      referredBy: referringFarmer ? referringFarmer._id : null,
      points: 0,
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
    const farmerId = req.params.id;
    const updates = req.body; // Data to be updated

    // Find the farmer and update the fields
    const updatedFarmer = await Farmer.findByIdAndUpdate(
      farmerId,
      updates,
      { new: true, runValidators: true } // Return updated doc & validate input
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
    const farmers = await Farmer.find({}, '-password')
      .populate({
        path: 'referredBy',
        select: 'name',
      });

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
    res.status(200).json({
      message: "OTP sent successfully",
      otp,
      isKYCVerified: farmer.isKYCVerified,
    });
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

    const farmer = await Farmer.findOne({ phoneNumber });
    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    if (!farmer.isKYCVerified) {
      return res.status(403).json({ message: "Your KYC is not verified yet" });
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

    // Token generate
    const token = generateToken(farmer._id, "farmer");

    res.status(200).json({
      message: "Farmer login successful",
      token,
      farmer: {
        id: farmer._id,
        name: farmer.name,
        phoneNumber: farmer.phoneNumber,
        role: "farmer",
        points: farmer.points, // optional: frontend ko current points bhejne ke liye

      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


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
    farmer.points += 5;

    await farmer.save();

    // ✅ Add transaction history
    await PointTransaction.create({
      farmer: farmer._id,
      points: 5,
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
    const farmer = await Farmer.findById(farmerId)
      .lean();
    if (!farmer) return res.status(404).json({ message: "Farmer not found" });

    // 2. Find all referred farmers
    const referredFarmers = await Farmer.find({ referredBy: farmerId })
      .select("name referralCode")
      .lean();

    // 3. Prepare response
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

}


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

    const farmerId = req.params; 

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



module.exports = {
  registerFarmer,
  farmerLogin,
  requestKYC,
  getAllFarmers,
  getFarmerById,
  updateFarmerById,
  farmerLoginWithOTP,
  sendOTPToFarmer,
  rewardDailyPoints,
  incrementReferralShare,
  getFarmerReferralDetails,
  getPointTransactions,
  getFarmerByIdForAdmin,
  getFarmersByCity,
  getFarmerDetailsById
};

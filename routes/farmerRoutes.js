const express = require('express');
const { farmerLogin, registerFarmer, requestKYC, getAllFarmers, sendOTPToFarmer, farmerLoginWithOTP, getFarmerById, updateFarmerById, rewardDailyPoints, incrementReferralShare, getFarmerReferralDetails, getPointTransactions, getFarmerByIdForAdmin, getFarmersByCity, getFarmerDetailsById, upgradeFarmerPoints, } = require('../controllers/farmerController');
const { authorize } = require('../middlewares/authMiddleware');
// const upload = require('../middlewares/upload');
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { createRazorpayOrderForFarmerPoints, applyFarmerUpgradePlan, createPlanOrder } = require('../controllers/razorpayController');
const { getActiveFarmerPlanById } = require('../controllers/FarmerPlanController');

// Setup multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Handle both fields
const multipleUploads = upload.fields([
  { name: "uploadAadharCard", maxCount: 1 },
  { name: "profileImg", maxCount: 1 },
]);

// Register Farmer

router.post("/farmer/register", multipleUploads, registerFarmer);

// router.post('/farmer/register', upload.single('uploadAadharCard'), registerFarmer);

// Farmer login
router.post('/farmer/login', farmerLogin);

// Api For farmer request for kyc verifcation
router.post("/farmer/kyc-request", authorize(["farmer"]), requestKYC);

router.get('/farmers', getAllFarmers);

router.post('/send-otp-to-farmer', sendOTPToFarmer);

router.post("/farmer-login-otp-verify", farmerLoginWithOTP);


router.get('/farmer/get/:farmerId', authorize(["farmer", "admin"]), getFarmerById);


router.get('/farmer/update/:farmerId', authorize(["farmer"]), updateFarmerById);


router.get('/get/farmer-details/:farmerId', getFarmerDetailsById);


// Daily Reward
router.post('/farmer/reward-daily', authorize(["farmer"]), rewardDailyPoints);


// POST /api/farmer/referral-share
router.post('/farmer/referral-share', authorize(["farmer"]), incrementReferralShare);


// get /api/farmer/referral-details
router.get('/farmer/referral-details/:id', authorize(["admin"]), getFarmerReferralDetails);


// get /api/farmer/points transaction history
router.get('/farmer/points-transaction/:farmerId', authorize(["admin", "farmer"]), getPointTransactions);


router.get('/farmer/getbyadmin/:farmerId', authorize(["admin"]), getFarmerByIdForAdmin);

// get farmer active plans
router.get("/farmer/active-plans/:farmerId", authorize(["admin", "farmer"]), getActiveFarmerPlanById);

// Route to get farmers by city_district
router.get("/farmers/by-city", getFarmersByCity);

// upgrade farmer points
router.post('/farmer/upgradePoints/:farmerId', authorize(["farmer"]), upgradeFarmerPoints);  


// Route for creating Razorpay order for farmer upgrade plan
router.post('/farmer/create-order-plan',  authorize(["farmer"]), createPlanOrder);


// Route for creating Razorpay order for farmer upgrade points
router.post('/farmer/createRazorpayOrder',  authorize(["farmer"]), createRazorpayOrderForFarmerPoints);


// upgrade farmer plan api
router.post('/farmer/applyUpgradePlan', authorize(["farmer"]), applyFarmerUpgradePlan);


module.exports = router;

const express = require('express');
const { farmerLogin, registerFarmer, requestKYC, getAllFarmers, sendOTPToFarmer, farmerLoginWithOTP, getFarmerById, updateFarmerById, rewardDailyPoints, incrementReferralShare, getFarmerReferralDetails, getPointTransactions, getFarmerByIdForAdmin, getFarmersByCity, getFarmerDetailsById, upgradeFarmerPoints, getFarmerInvoiceByOrderId, getFarmerInvoiceByFarmerId, deleteFarmerById, } = require('../controllers/farmerController');
const { authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const router = express.Router();
const { createRazorpayOrderForFarmerPoints, applyFarmerUpgradePlan, createPlanOrder } = require('../controllers/razorpayController');
const { getActiveFarmerPlanById, getAllFarmerPlans } = require('../controllers/FarmerPlanController');
const { getRedeemProductsByFarmerId } = require('../controllers/rcProductController');
const uploadAadhar = require('../middlewares/uploadAadhar');


// Register Farmer
router.post("/farmer/register", uploadAadhar.single("uploadAadharCard"), registerFarmer);

// router.post('/farmer/register', upload.single('uploadAadharCard'), registerFarmer);

// Farmer login
router.post('/farmer/login', farmerLogin);

// Api For farmer request for kyc verifcation
router.post("/farmer/kyc-request", authorize(["farmer"]), requestKYC);


router.get('/farmers', getAllFarmers);


router.post('/send-otp-to-farmer', sendOTPToFarmer);


router.post("/farmer-login-otp-verify", farmerLoginWithOTP);


router.get('/farmer/get/:farmerId', authorize(["farmer", "admin"]), getFarmerById);


router.put('/farmer/update/:farmerId', authorize(["farmer", "admin"]), upload.single('profileImg'), updateFarmerById);


router.delete('/admin/delete-farmer/:farmerId', authorize(["admin"]),  deleteFarmerById);

router.get('/get/farmer-details/:farmerId', getFarmerDetailsById);


// Daily Reward
router.post('/farmer/reward-daily', authorize(["farmer"]), rewardDailyPoints);

// POST /api/farmer/referral-share
router.post('/farmer/referral-share', authorize(["farmer"]), incrementReferralShare);


// get /api/farmer/referral-details
router.get('/farmer/referral-details/:id', authorize(["farmer", "admin"]), getFarmerReferralDetails);


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
router.post('/farmer/create-order-plan', authorize(["farmer"]), createPlanOrder);


// Route for creating Razorpay order for farmer upgrade points
router.post('/farmer/createRazorpayOrder', authorize(["farmer"]), createRazorpayOrderForFarmerPoints);


// upgrade farmer plan api
router.post('/farmer/applyUpgradePlan', authorize(["farmer"]), applyFarmerUpgradePlan);


// Get redemption history for a specific customer by farmer id
router.get('/farmer/redeem-history/:farmerId', authorize(["farmer"]), getRedeemProductsByFarmerId);


router.get('/farmers/upgrade-plans/transactions', getAllFarmerPlans);


router.get('/farmer/invoice/:orderId', getFarmerInvoiceByOrderId);


module.exports = router;

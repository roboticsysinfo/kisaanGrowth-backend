const express = require('express');
const { farmerLogin, registerFarmer, requestKYC, getAllFarmers, sendOTPToFarmer, farmerLoginWithOTP, getFarmerById, updateFarmerById, rewardDailyPoints, incrementReferralShare, getFarmerReferralDetails, getPointTransactions, getFarmerByIdForAdmin, } = require('../controllers/farmerController');
const { authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const router = express.Router();


// Register Farmer
router.post('/farmer/register', upload.single('uploadAadharCard'), registerFarmer);


// Farmer login
router.post('/farmer/login', farmerLogin);


// Api For farmer request for kyc verifcation
router.post("/farmer/kyc-request", authorize(["farmer"]), requestKYC);


router.get('/farmers', authorize(["admin"]), getAllFarmers);


router.post('/send-otp-to-farmer', sendOTPToFarmer);


router.post("/farmer-login-otp-verify", farmerLoginWithOTP);


router.get('/farmer/get/:farmerId', authorize(["farmer", "admin"]), getFarmerById);


router.get('/farmer/update/:farmerId', authorize(["farmer"]), updateFarmerById);


// Daily Reward
router.post('/farmer/reward-daily', authorize(["farmer"]), rewardDailyPoints);


// POST /api/farmer/referral-share
router.post('/farmer/referral-share', authorize(["farmer"]), incrementReferralShare);


// get /api/farmer/referral-details
router.get('/farmer/referral-details/:id', authorize(["admin"]), getFarmerReferralDetails);


// get /api/farmer/points transaction history
router.get('/farmer/points-transaction/:farmerId', authorize(["admin", "farmer"]), getPointTransactions);


router.get('/farmer/getbyadmin/:farmerId', authorize(["admin"]), getFarmerByIdForAdmin);

module.exports = router;

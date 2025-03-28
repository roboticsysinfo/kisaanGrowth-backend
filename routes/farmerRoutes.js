const express = require('express');
const { farmerLogin, registerFarmer, requestKYC, getAllFarmers, sendOTPToFarmer, farmerLoginWithOTP, } = require('../controllers/farmerController');
const { authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload')
const router = express.Router();

// Register a 
router.post('/farmer/register', upload.single('uploadAadharCard'), registerFarmer);

// User login
router.post('/farmer/login', farmerLogin);

// Api For farmer request for kyc verifcation
router.post("/farmer/kyc-request", authorize(["farmer"]), requestKYC);

router.get('/farmers', authorize(["admin"]), getAllFarmers);

router.post('/send-otp-to-farmer', sendOTPToFarmer);

router.post("/farmer-login-otp-verify", farmerLoginWithOTP);


module.exports = router;

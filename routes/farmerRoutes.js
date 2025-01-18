const express = require('express');
const { farmerLogin, registerFarmer, requestKYC } = require('../controllers/farmerController');
const { authorize } = require('../middlewares/authMiddleware');
const router = express.Router();

// Register a 
router.post('/farmer/register', registerFarmer);

// User login
router.post('/farmer/login', farmerLogin);

// Api For farmer request for kyc verifcation
router.post("/farmer/kyc-request", authorize(["farmer"]), requestKYC);




module.exports = router;

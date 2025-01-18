const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, getKYCRequests, approveKYC, rejectKYC } = require('../controllers/AdminController');
const { authorize } = require('../middlewares/authMiddleware');

// Register a user (Farmer, Customer, Admin, Sub Admin)
router.post('/admin/register', registerAdmin);

// User login
router.post('/admin/login', loginAdmin);

// Admin route to get all KYC requests
router.get("/admin/kyc-requests", authorize(["admin"]), getKYCRequests);

// Admin route to approve KYC
router.put("/admin/kyc-request/approve/:id", authorize(["admin"]), approveKYC);

// Admin route to reject KYC
router.put("/admin/kyc-request/reject/:id", authorize(["admin"]), rejectKYC);

module.exports = router;

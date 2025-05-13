const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, getKYCRequests, approveKYC, rejectKYC, getAllAdmins, updateAdmin, deleteAdmin } = require('../controllers/AdminController');
const { authorize } = require('../middlewares/authMiddleware');
const { createPlanOrder, verifyPayment } = require('../controllers/razorpayController');
const verifyCaptcha = require("../middlewares/verifyCaptcha");


// Register a user (Farmer, Customer, Admin, Sub Admin)
router.post('/admin/register', registerAdmin);

// User login
router.post('/admin/login', loginAdmin);


router.get('/admin/users', authorize(["admin"]), getAllAdmins)


router.put('/admin/user/:id', authorize(["admin"]), updateAdmin)


router.delete('/admin/user/:id', authorize(["admin"]), deleteAdmin)


// Admin route to get all KYC requests
router.get("/admin/kyc-requests", authorize(["admin"]), getKYCRequests);


// Admin route to approve KYC
router.put("/admin/kyc-request/approve/:id", authorize(["admin"]), approveKYC);


// Admin route to reject KYC
router.put("/admin/kyc-request/reject/:id", authorize(["admin"]), rejectKYC);


router.post("/createPlanOrder", createPlanOrder);


router.post("/verifyPayment", verifyPayment);


module.exports = router;

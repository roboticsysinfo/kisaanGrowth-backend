const express = require("express");
const { authorize } = require("../middlewares/authMiddleware");
const { sendFamilyRequest, getRequestsForFarmer, getAllFamilyRequests, updateRequestStatus, getRequestsForCustomer } = require('../controllers/familyFarmerController')

const router = express.Router();

// Send request (Customer → Farmer)
router.post('/family-farmer-request/send', authorize(["customer"]), sendFamilyRequest);

// Farmer: Get their own requests
router.get('/family-farmer-requests/:farmerId', authorize(["farmer", "admin"]), getRequestsForFarmer);

// Farmer: Get their own requests
router.get('/customer/family-farmer-requests/:customerId', authorize(["customer", "admin"]), getRequestsForCustomer)

// Admin: Get all requests
router.get('/family-farmer-requests/all', authorize(["admin"]), getAllFamilyRequests);

// Accept/Reject request
router.put('/family-farmer-request/status/:requestId', authorize(["farmer", "admin"]), updateRequestStatus);


module.exports = router;

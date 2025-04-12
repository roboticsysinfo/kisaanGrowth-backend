const express = require("express");
const { authorize } = require("../middlewares/authMiddleware");
const { sendFamilyRequest, getRequestsForFarmer, getAllFamilyRequests, updateRequestStatus } = require('../controllers/familyFarmerController')

const router = express.Router();

// Send request (Customer → Farmer)
router.post('/family-farmer-request/send', sendFamilyRequest);

// Farmer: Get their own requests
router.get('/family-farmer-requests/:farmerId', getRequestsForFarmer);

// Admin: Get all requests
router.get('/family-farmer-requests/all', getAllFamilyRequests);

// Accept/Reject request
router.put('/family-farmer-request/status/:requestId', updateRequestStatus);


module.exports = router;

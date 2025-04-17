const express = require("express");
const { createRequestOrder, getFarmerRequests, getFarmerOrderRequestbyId, getCustomerOrders, approveRequest, cancelRequest, getCustomerOrderByOrderId } = require("../controllers/requestOrderController");
const { authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

// Customer request order
router.post("/request-order", authorize(['customer']), createRequestOrder);

// Farmer Get Request in His panel
router.get("/order-requests", authorize(['farmer', 'admin']), getFarmerRequests);

router.get("/order-requests/farmer/:farmerId", authorize(['farmer']), getFarmerOrderRequestbyId );

// Approve Request (Admin/Farmer)
router.put("/approve/:requestId", authorize(['farmer', 'admin']), approveRequest);

// Get My Orders (Customer)
router.get("/my-orders", authorize(['customer']), getCustomerOrders);

router.put("/cancel/:requestId", authorize(['farmer', 'customer', 'admin']), cancelRequest);

// get single order
router.get("/customer/order/:orderId", authorize(['customer']), getCustomerOrderByOrderId);


module.exports = router;

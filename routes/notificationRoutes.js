const express = require("express");
const { getNotifications, markAsRead } = require("../controllers/notificationController");
const router = express.Router();
const authorize = require("../middlewares/authMiddleware");


//  Fetch user notifications (Customer/Farmer)
router.get("/notifications", authorize([farmer, customer, admin]), getNotifications);


//  Mark notification as read
router.put("/notification/:id/read", authorize([farmer, customer, admin]), markAsRead);


module.exports = router;

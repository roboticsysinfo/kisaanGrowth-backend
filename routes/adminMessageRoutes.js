const express = require("express");
const {
  createMessage,
  getAllMessages,
  updateMessage,
  deleteMessage,
} = require("../controllers/adminMessageController");
const { authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

// Admin Only Routes
router.post("/admin/message", authorize(["admin"]), createMessage);
router.get("/admin/messages", getAllMessages);
router.put("/admin/message/:id", authorize(["admin"]), updateMessage);
router.delete("/admin/message/:id", authorize(["admin"]), deleteMessage);

// For app (farmer or customer can view messages)
// router.get("/messages", getAllMessages); // Public route for app

module.exports = router;

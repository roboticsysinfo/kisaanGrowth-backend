const express = require("express");
const { authorize } = require("../middlewares/authMiddleware");
const { createHelpSupportTicket } = require("../controllers/helpSupportController");

const router = express.Router();

router.post("/help-support", authorize(["farmer", "customer"]), createHelpSupportTicket);

module.exports = router;

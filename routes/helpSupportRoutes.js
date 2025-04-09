const express = require("express");
const { authorize } = require("../middlewares/authMiddleware");
const { createHelpSupportTicket, getAllHelpSupportTickets } = require("../controllers/helpSupportController");

const router = express.Router();

router.post("/help-support", authorize(["farmer", "customer"]), createHelpSupportTicket);

router.get("/get-helpsupport-tickets", authorize(["admin"]), getAllHelpSupportTickets);

module.exports = router;

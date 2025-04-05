const HelpSupportTicket = require("../models/HelpSupport");

const createHelpSupportTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: "Subject and message are required" });
    }

    const { name, email, phoneNumber } = req.user;

    const ticket = new HelpSupportTicket({
      name,
      email,
      phoneNumber,
      subject,
      message,
    });

    await ticket.save();

    res.status(201).json({ message: "Support ticket submitted successfully" });
  } catch (error) {
    console.error("Support ticket error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createHelpSupportTicket,
};

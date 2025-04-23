const CustomerHelpSupport = require("../models/CustomerHelpSupport")


// ✅ Create Help & Support Entry
const createHelpSupport = async (req, res) => {
    try {
      const { name, email, phone, subject, message } = req.body;
  
      // Extract customer ID from the authenticated user
      const customerId = req.user && req.user.id;
  
      if (!customerId) {
        return res.status(401).json({ message: "Unauthorized: Customer ID missing" });
      }
  
      if (!name || !email || !phone || !subject || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      const support = new CustomerHelpSupport({
        customer: customerId,
        name,
        email,
        phone,
        subject,
        message
      });
  
      await support.save();
  
      res.status(201).json({ message: "Support request submitted", support });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };


// ✅ Get All Help & Support Requests
const getAllHelpSupport = async (req, res) => {
  try {
    const supports = await CustomerHelpSupport.find().sort({ createdAt: -1 });
    res.status(200).json(supports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Update Support Request (Admin)
const updateHelpSupport = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, subject, message } = req.body;

    const updated = await CustomerHelpSupport.findByIdAndUpdate(
      id,
      { name, email, phone, subject, message },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Support request not found" });
    }

    res.status(200).json({ message: "Support request updated", support: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Delete Support Request (Admin)
const deleteHelpSupport = async (req, res) => {
  try {

    const { id } = req.params;

    const deleted = await CustomerHelpSupport.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Support request not found" });
    }

    res.status(200).json({ message: "Support request deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }

};

module.exports = {
  createHelpSupport,
  getAllHelpSupport,
  updateHelpSupport,
  deleteHelpSupport
};

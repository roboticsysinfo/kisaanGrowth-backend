const AdminMessage = require("../models/AdminMessage");

// ✅ Create Message
const createMessage = async (req, res) => {

  try {

    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    const newMessage = new AdminMessage({ title, message });
    await newMessage.save();

    res.status(201).json({ message: "Message created successfully" });
  } catch (err) {

    console.error("Error creating message:", err);
    res.status(500).json({ message: "Server error" });

  }

};


// ✅ Get All Messages
const getAllMessages = async (req, res) => {
  try {
    
    const messages = await AdminMessage.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Server error" });
  }

};


// ✅ Update Message
const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message } = req.body;

    const updated = await AdminMessage.findByIdAndUpdate(
      id,
      { title, message },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.status(200).json({ message: "Message updated successfully" });
  } catch (err) {
    console.error("Error updating message:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Delete Message
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await AdminMessage.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createMessage,
  getAllMessages,
  updateMessage,
  deleteMessage,
};

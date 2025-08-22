const AdminMessage = require("../models/AdminMessage");
const User = require("../models/User");
const sendPushNotification = require("../utils/fcm")


// ✅ Create Message
const createMessage = async (req, res) => {
  try {
    const { title, message, type } = req.body;

    if (!title || !message || !type) {
      return res.status(400).json({ message: "Title, message, and type are required" });
    }

    if (!['farmer', 'customer'].includes(type)) {
      return res.status(400).json({ message: "Type must be either 'farmer' or 'customer'" });
    }

    // ✅ Save message in DB
    const newMessage = new AdminMessage({ title, message, type });
    await newMessage.save();

    // ✅ Find users according to type
    const users = await User.find({
      role: type,
      fcmToken: { $exists: true, $ne: null }
    });

    console.log("users", users);
    
    
    // ✅ Send push to each user
    for (const user of users) {
      await sendPushNotification(
        user.fcmToken,
        `📢 नया संदेश आया है!`,   // Notification Title
        `${title} - ${message}`   // Notification Body
      );
    }

    res.status(201).json({ message: "Message created and sent successfully" });

  } catch (err) {
    console.error("Error creating message:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Create Message
// const createMessage = async (req, res) => {
//   try {
//     const { title, message, type } = req.body;

//     if (!title || !message || !type) {
//       return res.status(400).json({ message: "Title, message, and type are required" });
//     }

//     if (!['farmer', 'customer'].includes(type)) {
//       return res.status(400).json({ message: "Type must be either 'farmer' or 'customer'" });
//     }

//     const newMessage = new AdminMessage({ title, message, type });
//     await newMessage.save();

//     res.status(201).json({ message: "Message created successfully" });
//   } catch (err) {
//     console.error("Error creating message:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// ✅ Get All Messages (optionally filter by type)
const getAllMessages = async (req, res) => {
  try {
    const { type } = req.query;

    const filter = type && ['farmer', 'customer'].includes(type) ? { type } : {};

    const messages = await AdminMessage.find(filter).sort({ createdAt: -1 });
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
    const { title, message, type } = req.body;

    if (type && !['farmer', 'customer'].includes(type)) {
      return res.status(400).json({ message: "Type must be either 'farmer' or 'customer'" });
    }

    const updated = await AdminMessage.findByIdAndUpdate(
      id,
      { title, message, type },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.status(200).json({ message: "Message updated successfully", data: updated });
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

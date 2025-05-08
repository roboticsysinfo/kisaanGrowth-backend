const mongoose = require("mongoose");
const Notification = require("../models/Notification");

const sendNotification = async (userId, userType, type, message, actorId, actorType) => {  // ✅ actorType parameter add
  try {
    // Ensure actorId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(actorId)) {
      console.error("Invalid actorId provided for notification.");
      return;
    }

    const validActorId = new mongoose.Types.ObjectId(actorId); // ✅ Correct way

    const notification = new Notification({
      userId,
      userType,
      type,
      message,
      actorId: validActorId,
      actorType, // ✅ Corrected
    });

    await notification.save();
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

module.exports = { sendNotification };

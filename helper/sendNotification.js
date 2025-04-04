const Notification = require("../models/Notification");

const sendNotification = async (userId, type, message) => {
    
  try {
    const notification = new Notification({ userId, type, message });
    await notification.save();
  } catch (error) {
    console.error("Error sending notification:", error);
  }

};

module.exports = { sendNotification };

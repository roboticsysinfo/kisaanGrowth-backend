const Notification = require("../models/Notification");

const sendNotification = async (userId, userType, type, message) => {

  try {

    const notification = new Notification({ userId, userType, actorId, actorType, type, message });

    await notification.save();

  } catch (error) {

    console.error("❌ Error sending notification:", error);

  }

};

module.exports = { sendNotification };

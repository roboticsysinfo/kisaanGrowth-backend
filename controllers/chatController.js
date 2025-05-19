// controllers/chatController.js
const ChatMessage = require("../models/ChatMessage");
const Customer = require("../models/Customer");
const Farmer = require("../models/Farmer");
const { sendPushNotification } = require("../utils/fcm");

exports.sendMessage = async (req, res) => {

  const { senderId, senderType, receiverId, receiverType, message } = req.body;

  const chat = await ChatMessage.create({ senderId, senderType, receiverId, receiverType, message });

  let receiver;
  if (receiverType === "customer") {
    receiver = await Customer.findById(receiverId);
  } else {
    receiver = await Farmer.findById(receiverId);
  }

  if (receiver?.fcmToken) {
    await sendPushNotification(receiver.fcmToken, "New Message", message);
  }

  res.status(200).json({ success: true, chat });

};

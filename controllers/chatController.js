// controllers/chatController.js
const ChatMessage = require("../models/ChatMessage");
const Customer = require("../models/Customer");
const Farmer = require("../models/Farmer");
const { sendPushNotification } = require("../utils/fcm");

exports.sendMessage = async (req, res) => {

  const { senderId, senderType, receiverId, receiverType, message } = req.body;


  console.log("Message Body:", {
    senderId,
    senderType,
    receiverId,
    receiverType,
    message,
  });

  const chat = await ChatMessage.create({ senderId, senderType, receiverId, receiverType, message });

  console.log("chat create", chat);

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


// Get Farmer Chats List

exports.getFarmerChatList = async (req, res) => {

  try {
    const farmerId = req.user.id;

    const chatList = await ChatMessage.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(farmerId), senderType: "farmer" },
            { receiverId: new mongoose.Types.ObjectId(farmerId), receiverType: "farmer" },
          ],
        },
      },
      {
        $addFields: {
          otherUserId: {
            $cond: [
              { $eq: ["$senderType", "farmer"] },
              "$receiverId",
              "$senderId",
            ],
          },
          otherUserType: {
            $cond: [
              { $eq: ["$senderType", "farmer"] },
              "$receiverType",
              "$senderType",
            ],
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$otherUserId",
          lastMessage: { $first: "$message" },
          timestamp: { $first: "$createdAt" },
          otherUserType: { $first: "$otherUserType" },
        },
      },
    ]);

    // Optional: Populate customer or farmer info
    // You can loop and fetch name, image from Farmer or Customer models

    res.json(chatList);
  } catch (error) {
    console.error("Get Chat List Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

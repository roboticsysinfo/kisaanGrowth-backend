// controllers/chatController.js
const { default: mongoose } = require("mongoose");
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
    const { farmerId } = req.params;

    const chatList = await ChatMessage.aggregate([
      {
        $match: {
          receiverId: new mongoose.Types.ObjectId(farmerId),
          receiverType: "farmer",
          senderType: "customer",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$senderId", // group by customer
          lastMessage: { $first: "$message" },
          timestamp: { $first: "$createdAt" },
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: "$customer",
      },
      {
        $project: {
          customerId: "$_id",
          name: "$customer.name",
          avatar: "$customer.profileImage",
          lastMessage: 1,
          timestamp: 1,
        },
      },
    ]);

    res.json(chatList);
  } catch (error) {
    console.error("Get Chat List Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Get chat details between farmer and customer

exports.getChatBetweenFarmerAndCustomer = async (req, res) => {
  try {
    const { farmerId, customerId } = req.params;

    const messages = await ChatMessage.find({
      $or: [
        { senderId: farmerId, senderType: 'farmer', receiverId: customerId, receiverType: 'customer' },
        { senderId: customerId, senderType: 'customer', receiverId: farmerId, receiverType: 'farmer' },
      ],
    }).sort({ createdAt: 1 }); // oldest to newest

    res.status(200).json(messages);
  } catch (error) {
    console.error('Get Chat Details Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

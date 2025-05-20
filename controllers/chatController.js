const { default: mongoose } = require("mongoose");
const ChatMessage = require("../models/ChatMessage");
const Customer = require("../models/Customer");
const Farmer = require("../models/Farmer");
const { sendPushNotification } = require("../utils/fcm");
const { decrypt } = require("../utils/encryption"); 


// exports.sendMessage = async (req, res) => {


//   const { senderId, senderType, receiverId, receiverType, message } = req.body;

//   console.log("Message Body:", {
//     senderId,
//     senderType,
//     receiverId,
//     receiverType,
//     message,
//   });

//   const chat = await ChatMessage.create({ senderId, senderType, receiverId, receiverType, message });

//   console.log("chat create", chat);

//   let receiver;

//   if (receiverType === "customer") {
//     receiver = await Customer.findById(receiverId);
//   } else {
//     receiver = await Farmer.findById(receiverId);
//   }

//   if (receiver?.fcmToken) {
//     await sendPushNotification(receiver.fcmToken, "New Message", message);
//   }

//   res.status(200).json({ success: true, chat });

// };


// Get Farmer Chats List


exports.sendMessage = async (req, res) => {
  const { senderId, senderType, receiverId, receiverType, message } = req.body;

  console.log("Message Body:", {
    senderId,
    senderType,
    receiverId,
    receiverType,
    message,
  });

  const chat = await ChatMessage.create({
    senderId,
    senderType,
    receiverId,
    receiverType,
    message, // will be auto-encrypted by model's pre-save
  });

  console.log("chat create", chat);

  let receiver;
  if (receiverType === "customer") {
    receiver = await Customer.findById(receiverId);
  } else {
    receiver = await Farmer.findById(receiverId);
  }

  if (receiver?.fcmToken) {
    await sendPushNotification(receiver.fcmToken, "New Message", message); // plain message for notification
  }

  res.status(200).json({
    success: true,
    chat: {
      ...chat.toObject(),
      message, // return plain message instead of encrypted one
    },
  });
};


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
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$senderId",
          lastMessage: { $first: "$message" },
          timestamp: { $first: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [{ $eq: ["$isRead", false] }, 1, 0],
            },
          },
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
      { $unwind: "$customer" },
    ]);

    // Decrypt lastMessage before sending
    const decryptedList = chatList.map((chat) => ({
      customerId: chat._id,
      name: chat.customer.name,
      avatar: chat.customer.profileImage,
      lastMessage: decrypt(chat.lastMessage),
      timestamp: chat.timestamp,
      unreadCount: chat.unreadCount,
    }));

    res.json(decryptedList);
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
        {
          senderId: farmerId,
          senderType: "farmer",
          receiverId: customerId,
          receiverType: "customer",
        },
        {
          senderId: customerId,
          senderType: "customer",
          receiverId: farmerId,
          receiverType: "farmer",
        },
      ],
    }).sort({ createdAt: 1 });

    const decryptedMessages = messages.map((msg) => ({
      ...msg.toObject(),
      message: msg.getDecryptedMessage(), // use instance method from model
    }));

    res.status(200).json(decryptedMessages);
  } catch (error) {
    console.error("Get Chat Details Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// mark as read unread message for farmer 

exports.markMessagesAsRead = async (req, res) => {
  try {
    const { customerId, farmerId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(customerId) ||
      !mongoose.Types.ObjectId.isValid(farmerId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid customerId or farmerId" });
    }

    const result = await ChatMessage.updateMany(
      {
        $or: [
          {
            senderId: new mongoose.Types.ObjectId(customerId),
            senderType: "customer",
            receiverId: new mongoose.Types.ObjectId(farmerId),
            receiverType: "farmer",
          },
          {
            senderId: new mongoose.Types.ObjectId(farmerId),
            senderType: "farmer",
            receiverId: new mongoose.Types.ObjectId(customerId),
            receiverType: "customer",
          },
        ],
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    res.json({
      success: true,
      message: "All messages marked as read between customer and farmer",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error in markMessagesAsRead:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

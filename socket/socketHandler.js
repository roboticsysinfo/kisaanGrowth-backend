const ChatMessage = require("../models/ChatMessage");
const Customer = require("../models/Customer");
const Farmer = require("../models/Farmer");


const onlineUsers = {};


exports.setupSocket = (io) => {

  io.on("connection", (socket) => {
    console.log("🔌 New client connected");

    // Register user (for online status)
    socket.on("register", async ({ userId, userType }) => {
      const userKey = `${userId}_${userType}`;


      onlineUsers[userKey] = socket.id;
      console.log("✅ Registered:", userKey);

      // Update isOnline in DB
      if (userType === "farmer") {
        await Farmer.findByIdAndUpdate(userId, { isOnline: true });
      } else if (userType === "customer") {
        await Customer.findByIdAndUpdate(userId, { isOnline: true });
      }

      // Broadcast updated user status
      io.emit("user_status", { userId, userType, isOnline: true });
    });

    // Handle send message
    socket.on("sendMessage", async (data) => {
      const {
        senderId,
        senderType,
        receiverId,
        receiverType,
        message,
        timestamp,
      } = data;

      const newMessage = new ChatMessage({
        senderId,
        senderType,
        receiverId,
        receiverType,
        message,
        timestamp,
      });

      await newMessage.save();

      // Decrypt before emitting
      const decryptedMessage = {
        ...newMessage.toObject(),
        message: newMessage.getDecryptedMessage(),
      };

      // Send to receiver if online
      const receiverSocket = onlineUsers[`${receiverId}_${receiverType}`];
      if (receiverSocket) {
        io.to(receiverSocket).emit("newMessage", decryptedMessage);
      }
    });

    // Typing indicator
    socket.on("typing", ({ toUserId, toRole, fromUserId }) => {
      const receiverSocket = onlineUsers[`${toUserId}_${toRole}`];
      if (receiverSocket) {
        io.to(receiverSocket).emit("user_typing", { fromUserId });
      }
    });

    socket.on("stop_typing", ({ toUserId, toRole, fromUserId }) => {
      const receiverSocket = onlineUsers[`${toUserId}_${toRole}`];
      if (receiverSocket) {
        io.to(receiverSocket).emit("user_stop_typing", { fromUserId });
      }
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      console.log("❌ User disconnected");

      // Find and remove from onlineUsers
      const userKey = Object.keys(onlineUsers).find(
        (key) => onlineUsers[key] === socket.id
      );

      if (userKey) {
        const [userId, userType] = userKey.split("_");
        delete onlineUsers[userKey];

        // Update isOnline in DB
        if (userType === "farmer") {
          await Farmer.findByIdAndUpdate(userId, { isOnline: false });
        } else if (userType === "customer") {
          await Customer.findByIdAndUpdate(userId, { isOnline: false });
        }

        // Broadcast updated status
        io.emit("user_status", { userId, userType, isOnline: false });
      }

    });

  });

};


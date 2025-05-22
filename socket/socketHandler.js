const ChatMessage = require("../models/ChatMessage");
const Customer = require("../models/Customer");
const Farmer = require("../models/Farmer");
const { getChatRoomId } = require("../helper/chatRoom");
const { decrypt } = require("../utils/encryption");

const onlineUsers = {}; // { userId_userType: socket.id }

exports.setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 नया client जुड़ा", socket.id);

    // ✅ Register user and track online status
    socket.on("register", ({ userId, userType }) => {
      const userKey = `${userId}_${userType}`;
      onlineUsers[userKey] = socket.id;
      socket.userKey = userKey;

      // Notify others
      io.emit("userOnline", { userId, userType });
      console.log(`✅ ${userKey} registered and online`);
    });

    // ✅ Join a chat room
    socket.on("joinRoom", ({ user1Id, user1Type, user2Id, user2Type }) => {
      const roomId = getChatRoomId(user1Id, user1Type, user2Id, user2Type);
      socket.join(roomId);
      console.log(`📥 Joined room ${roomId}`);
    });

    // ✅ Handle typing indicator
    socket.on("typing", ({ senderId, senderType, receiverId, receiverType }) => {
      const roomId = getChatRoomId(senderId, senderType, receiverId, receiverType);
      socket.to(roomId).emit("typing", {
        senderId,
        senderType,
        receiverId,
        receiverType,
      });
    });

    // ✅ Send and broadcast message
    socket.on("sendMessage", async ({ senderId, senderType, receiverId, receiverType, message }) => {
      try {
        const newMsg = await ChatMessage.create({
          senderId,
          senderType,
          receiverId,
          receiverType,
          message,
        });

        const decrypted = decrypt(newMsg.message);
        const roomId = getChatRoomId(senderId, senderType, receiverId, receiverType);

        const payload = {
          _id: newMsg._id,
          senderId,
          senderType,
          receiverId,
          receiverType,
          message: decrypted,
          timestamp: newMsg.timestamp,
          createdAt: newMsg.createdAt,
        };

        // Emit to all users in room
        io.to(roomId).emit("newMessage", payload);
        console.log(`📨 Message sent in room ${roomId}`);

        // Also notify receiver if they’re online
        const receiverKey = `${receiverId}_${receiverType}`;
        const receiverSocketId = onlineUsers[receiverKey];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newMessageNotification", payload);
        }
      } catch (error) {
        console.error("❌ Error sending message:", error);
        socket.emit("error", { message: "Message send failed" });
      }
    });

    // ✅ Mark messages as read in room
    socket.on("markAsRead", async ({ senderId, senderType, receiverId, receiverType }) => {
      try {
        const result = await ChatMessage.updateMany(
          {
            senderId,
            senderType,
            receiverId,
            receiverType,
            isRead: false,
          },
          { $set: { isRead: true } }
        );

        const roomId = getChatRoomId(senderId, senderType, receiverId, receiverType);
        io.to(roomId).emit("messagesRead", {
          senderId,
          receiverId,
          count: result.modifiedCount,
        });
      } catch (err) {
        console.error("❌ Error marking messages as read:", err);
      }
    });

    // ✅ Disconnect handler
    socket.on("disconnect", () => {
      const userKey = socket.userKey;
      if (userKey) {
        delete onlineUsers[userKey];
        const [userId, userType] = userKey.split("_");
        io.emit("userOffline", { userId, userType });
        console.log(`🚫 ${userKey} disconnected`);
      }
    });
  });
};

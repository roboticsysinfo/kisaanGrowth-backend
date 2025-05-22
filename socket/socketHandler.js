const ChatMessage = require("../models/ChatMessage");
const Customer = require("../models/Customer");
const Farmer = require("../models/Farmer");
const { getChatRoomId } = require("../helper/chatRoom");

const onlineUsers = {};

exports.setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 नया client जुड़ा");

    // ✅ Register & Join personal room
    socket.on("register", async ({ userId, userType }) => {
      const userKey = `${userId}_${userType}`;
      onlineUsers[userKey] = socket.id;
      socket.join(userKey); // 👉 हर यूज़र का खुद का एक room भी

      console.log("✅ Registered:", userKey);

      // DB में ऑनलाइन स्टेटस अपडेट करें
      if (userType === "farmer") {
        await Farmer.findByIdAndUpdate(userId, { isOnline: true });
      } else if (userType === "customer") {
        await Customer.findByIdAndUpdate(userId, { isOnline: true });
      }

      io.emit("user_status", { userId, userType, isOnline: true });
    });

    // ✅ Message भेजना (Chat Room के ज़रिए)
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

      const decryptedMessage = {
        ...newMessage.toObject(),
        message: newMessage.getDecryptedMessage(),
      };

      const chatRoom = getChatRoomId(senderId, senderType, receiverId, receiverType);

      // 👉 Ensure both users are in the same chatRoom
      socket.join(chatRoom); // sender को जोड़ा

      const receiverSocketId = onlineUsers[`${receiverId}_${receiverType}`];
      if (receiverSocketId) {
        io.sockets.sockets.get(receiverSocketId)?.join(chatRoom); // receiver को जोड़ा
      }

      // 🔁 Emit to both users in room
      io.to(chatRoom).emit("newMessage", decryptedMessage);
    });

    // ✅ Typing Indicator
    socket.on("typing", ({ toUserId, toRole, fromUserId, fromRole }) => {
      const room = getChatRoomId(toUserId, toRole, fromUserId, fromRole);
      socket.to(room).emit("user_typing", { fromUserId });
    });

    socket.on("stop_typing", ({ toUserId, toRole, fromUserId, fromRole }) => {
      const room = getChatRoomId(toUserId, toRole, fromUserId, fromRole);
      socket.to(room).emit("user_stop_typing", { fromUserId });
    });

    // ✅ Disconnect
    socket.on("disconnect", async () => {
      console.log("❌ यूज़र डिस्कनेक्ट हुआ");

      const userKey = Object.keys(onlineUsers).find(
        (key) => onlineUsers[key] === socket.id
      );

      if (userKey) {
        const [userId, userType] = userKey.split("_");
        delete onlineUsers[userKey];

        if (userType === "farmer") {
          await Farmer.findByIdAndUpdate(userId, { isOnline: false });
        } else if (userType === "customer") {
          await Customer.findByIdAndUpdate(userId, { isOnline: false });
        }

        io.emit("user_status", { userId, userType, isOnline: false });
      }
    });
  });
};

const Customer = require("../models/Customer");
const Farmer = require("../models/Farmer");

const onlineUsers = {};

exports.setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("register", async ({ userId, role }) => {
      onlineUsers[`${userId}_${role}`] = socket.id;

      const model = role === "customer" ? Customer : Farmer;
      await model.findByIdAndUpdate(userId, { isOnline: true });

      io.emit("user_status", { userId, role, status: "online" });
    });

    socket.on("typing", ({ toUserId, toRole, fromUserId }) => {
      const toSocket = onlineUsers[`${toUserId}_${toRole}`];
      if (toSocket) {
        io.to(toSocket).emit("user_typing", { fromUserId });
      }
    });

    socket.on("stop_typing", ({ toUserId, toRole, fromUserId }) => {
      const toSocket = onlineUsers[`${toUserId}_${toRole}`];
      if (toSocket) {
        io.to(toSocket).emit("user_stop_typing", { fromUserId });
      }
    });

    socket.on("disconnect", async () => {
      for (let key in onlineUsers) {
        if (onlineUsers[key] === socket.id) {
          const [userId, role] = key.split("_");
          const model = role === "customer" ? Customer : Farmer;
          await model.findByIdAndUpdate(userId, { isOnline: false });
          io.emit("user_status", { userId, role, status: "offline" });
          delete onlineUsers[key];
        }
      }
    });
  });
};

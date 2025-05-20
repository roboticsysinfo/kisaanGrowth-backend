// routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");


// chat send
router.post("/chat/send", chatController.sendMessage);

// get farmer chats list
router.get("/farmer/chats/:farmerId", chatController.getFarmerChatList);


module.exports = router;

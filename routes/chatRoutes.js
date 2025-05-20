// routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");


// chat send
router.post("/chat/send", chatController.sendMessage);

// get farmer chats list
router.get("/farmer/chats/:farmerId", chatController.getFarmerChatList);

// Chat between a farmer and customer
router.get('/farmer/chat-details/:farmerId/:customerId', chatController.getChatBetweenFarmerAndCustomertweenFarmerAndCustomer);

module.exports = router;

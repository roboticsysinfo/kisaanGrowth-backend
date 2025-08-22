// routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");



// chat send // for both farmer and customer 

router.post("/chat/send", chatController.sendMessage);


// get farmer chats list
router.get("/farmer/chats/:farmerId", chatController.getFarmerChatList);


// Chat between a farmer and customer
router.get('/farmer/chat-details/:farmerId/:customerId', chatController.getChatBetweenFarmerAndCustomer);


// PUT route to mark messages as read
router.put(
  "/farmer-messages/mark-read/:farmerId/:customerId",
  chatController.markMessagesAsRead
);

// 🗑️ Soft delete chat
router.delete("/delete-chat/:chatId", chatController.deleteChat);

// ============== Customer Chat Route ==============


// get customer chats list
router.get("/customer/chats/:customerId", chatController.getCustomerChatList);


// chat details between customer and farmer
router.get('/customer/chat-details/:customerId/:farmerId', chatController.getChatBetweenCustomerAndFarmer);


// PUT route to mark messages as read
router.put(
  "/customer-messages/mark-read/:customerId/:farmerId",
  chatController.markMessagesAsReadByCustomer
);

module.exports = router;

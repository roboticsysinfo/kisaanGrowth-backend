const Notification = require("../models/Notification");

const Farmer = require("../models/Farmer"); // Import Farmer Model
const Customer = require("../models/Customer"); // Import Customer Model


const getNotifications = async (req, res) => {
    try {
      const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
  
      const notificationsWithNames = await Promise.all(
        notifications.map(async (notification) => {
          let userName = "Unknown";
  
          if (notification.actorType === "farmer") {
            const farmer = await Farmer.findById(notification.actorId);
            if (farmer) userName = farmer.name;
          } else if (notification.actorType === "customer") {
            const customer = await Customer.findById(notification.actorId);
            if (customer) userName = customer.name;
          }
  
          return {
            ...notification._doc,
            userName,
          };
        })
      );
  
      res.status(200).json(notificationsWithNames);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Server error" });
    }
  };


// Mark Notification as Read

const markAsRead = async (req, res) => {
  
  try {
      const notification = await Notification.findById(req.params.notificationId); // ✅ Correct param
      if (!notification) {
          return res.status(404).json({ message: "Notification not found" });
      }

      notification.read = true;
      await notification.save();
      res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
  }

};


module.exports = { getNotifications, markAsRead };

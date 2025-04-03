const express = require("express");
const {
  addDeliveryPreference,
  updateDeliveryPreference,
  getDeliveryPreference,
} = require("../controllers/DeliveryPreferenceController");

const router = express.Router();

// Add Delivery Preference
router.post("/delivery-preference/add", addDeliveryPreference);

// Update Delivery Preference
router.put("/delivery-preference/update/:farmer_id", updateDeliveryPreference);

// Get Farmer's Delivery Preference
router.get("//delivery-preference/fetch/:farmer_id", getDeliveryPreference);

module.exports = router;

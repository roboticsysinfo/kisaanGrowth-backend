const DeliveryPreference = require("../models/DeliveryPreference");

// ✅ Add Delivery Preference
exports.addDeliveryPreference = async (req, res) => {
  try {
    const { farmer_id, delivery_method, delivery_range, additional_notes } = req.body;

    // Check if a preference already exists
    const existingPreference = await DeliveryPreference.findOne({ farmer_id });

    if (existingPreference) {
      return res.status(400).json({ message: "Delivery preference already exists for this farmer" });
    }

    const newPreference = new DeliveryPreference({
      farmer_id,
      delivery_method,
      delivery_range,
      additional_notes,
    });

    await newPreference.save();
    res.status(201).json({ message: "Delivery preference added successfully", data: newPreference });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ✅ Update Delivery Preference
exports.updateDeliveryPreference = async (req, res) => {
  try {
    const { farmer_id } = req.params;
    const { delivery_method, delivery_range, additional_notes } = req.body;

    const updatedPreference = await DeliveryPreference.findOneAndUpdate(
      { farmer_id },
      { delivery_method, delivery_range, additional_notes },
      { new: true }
    );

    if (!updatedPreference) {
      return res.status(404).json({ message: "Delivery preference not found for this farmer" });
    }

    res.json({ message: "Delivery preference updated successfully", data: updatedPreference });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ✅ Get Farmer's Delivery Preference
exports.getDeliveryPreference = async (req, res) => {
  try {
    const { farmer_id } = req.params;
    const preference = await DeliveryPreference.findOne({ farmer_id });

    if (!preference) {
      return res.status(404).json({ message: "No delivery preference found for this farmer" });
    }

    res.json({ message: "Delivery Preference Found", data: preference });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

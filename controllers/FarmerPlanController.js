const Farmer = require("../models/Farmer")
const Shop = require("../models/Shop")
const FarmerUpgradePlanHistory = require('../models/FarmerUpgradePlanHistory');


const getActiveFarmerPlanById = async (req, res) => {

  try {

    const { farmerId } = req.params;

    const activePlan = await FarmerUpgradePlanHistory.findOne({
      farmerId,
      expiresAt: { $gt: new Date() } // validity check
    }).sort({ purchasedAt: -1 }); // latest plan first

    if (!activePlan) {
      return res.status(404).json({ message: 'No active plan found for this farmer.' });
    }

    return res.status(200).json(activePlan);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }

};


// Get all plan histories (admin or reporting)
const getAllFarmerPlans = async (req, res) => {

  try {

    const plans = await FarmerUpgradePlanHistory.find()
      .populate('farmerId', 'name phoneNumber email') // optional: fetch farmer info
      .sort({ purchasedAt: -1 }); // latest first

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });

  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }

};

module.exports = {
  getActiveFarmerPlanById,
  getAllFarmerPlans
}

const Farmer = require("../models/Farmer")
const Shop = require("../models/Shop")
const FarmerUpgradePlanHistory = require('../models/FarmerUpgradePlanHistory');

const purchasePlan = async (req, res) => {

  const { farmerId, planName, planAmount, planValidityDays } = req.body;

  const farmer = await Farmer.findByIdAndUpdate(farmerId, {
    isUpgraded: true,
    upgradedAt: Date.now()
  }, { new: true });

  await Shop.updateMany(
    { farmerId: farmerId },
    { isFarmerUpgraded: true }
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + planValidityDays);

  const planHistory = new FarmerUpgradePlanHistory({
    farmerId,
    planName,
    planAmount,
    planValidityDays,
    purchasedAt: new Date(),
    expiresAt: expiresAt
  });

  await planHistory.save();

  res.status(200).json({
    message: 'Plan purchased successfully',
    farmer,
    planHistory
  });
};


const getFarmerPlansbyId = async (req, res) => {
    const { farmerId } = req.params;
  
    const plans = await FarmerPlanHistory.find({ farmerId }).sort({ purchasedAt: -1 });
  
    res.status(200).json(plans);
  };
  


module.exports={
    purchasePlan,
    getFarmerPlansbyId
}

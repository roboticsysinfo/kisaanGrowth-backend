const razorpayInstance = require("../config/razorpay")
const crypto = require('crypto');
const Farmer = require("../models/Farmer");
const FarmerUpgradePlanHistory = require("../models/FarmerUpgradePlanHistory");
const Shop = require("../models/Shop");


const createPlanOrder = async (req, res) => {

    const { planName, planAmount } = req.body; // amount in rupees
  
    const options = {
      amount: planAmount * 100, // Razorpay takes amount in paise (₹1 = 100 paise)
      currency: "INR",
      receipt: `receipt_order_${Math.random() * 1000}`,
    };
  
    try {
      const order = await razorpayInstance.orders.create(options);
      res.status(200).json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to create order" });
    }
  };
  

  const verifyPayment = async (req, res) => {
    
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      farmerId, 
      planName, 
      planAmount, 
      planValidityDays 
    } = req.body;
  
    // Validate the required fields are not missing
    if (!farmerId || !planName || !planAmount || !planValidityDays) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
  
    // Validate planValidityDays
    if (isNaN(planValidityDays) || planValidityDays <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid plan validity days' });
    }
  
    const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');
  
    if (generatedSignature === razorpay_signature) {
      try {
        // Update farmer plan and activate the upgrade
        const farmer = await Farmer.findByIdAndUpdate(farmerId, {
          isUpgraded: true,
          upgradedAt: Date.now()
        }, { new: true });
  
        // Update all related shops with upgrade status
        await Shop.updateMany(
          { farmerId: farmerId },
          { isFarmerUpgraded: true }
        );
  
        // Calculate expiry date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + planValidityDays);  // Add validity days
  
        // Create and save plan history
        const planHistory = new FarmerUpgradePlanHistory({
          farmerId,
          planName,
          planAmount,
          planValidityDays,
          purchasedAt: new Date(),
          expiresAt
        });
  
        await planHistory.save();
  
        res.status(200).json({ success: true, message: "Payment verified and plan activated", farmer });
      } catch (error) {
        console.error("Error during payment verification:", error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    } else {
      res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
  };
  
// for upgrade farmer points create order
 const createRazorpayOrderForFarmerPoints = async (req, res) => {
    const { amount } = req.body;
  
    const options = {
      amount: amount,  // Amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };
  
    try {
      const order = await razorpayInstance.orders.create(options);
      res.json({ success: true, order_id: order.id });
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      res.status(500).json({ success: false, message: 'Failed to create Razorpay order' });
    }
  };

  
  module.exports={
    createPlanOrder,
    verifyPayment,
    createRazorpayOrderForFarmerPoints
  }
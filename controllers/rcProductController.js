
const Customer = require("../models/Customer")
const CustomerPointsTransactions = require('../models/customerPointsTransactions');
const CustomerRedeemProduct = require("../models/CustomerRedeemProduct")
const CustomerRedemptionHistory = require("../models/CustomerRedeemptionHistory");
const RedemptionHistory = require("../models/RedemptionHistory");

// Add redeem product

const addRedeemProductCustomer = async (req, res) => {
    try {
        const { name, description, requiredPoints } = req.body;
        const rc_product_img = req.file ? req.file.path : null;

        if (!name || !description || !requiredPoints) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const product = new CustomerRedeemProduct({
            name,
            description,
            requiredPoints,
            rc_product_img
        });

        await product.save();
        res.status(201).json({ message: 'Redeem product created successfully', product });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


// get all redeem products
const getAllRedeemProductsCustomer = async (req, res) => {
    try {
        const products = await CustomerRedeemProduct.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

//update
const updateCustomerRedeemProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, requiredPoints } = req.body;
        const rc_product_img = req.file ? req.file.path : undefined;

        const product = await CustomerRedeemProduct.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.name = name || product.name;
        product.description = description || product.description;
        product.requiredPoints = requiredPoints || product.requiredPoints;
        if (rc_product_img) product.rc_product_img = rc_product_img;

        await product.save();
        res.status(200).json({ message: 'Redeem product updated', product });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// delete
const deleteCustomerRedeemProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await CustomerRedeemProduct.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Redeem product deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Redeem Product Customer ( Customer can redeem product )
const redeemProductCustomer = async (req, res) => {
    const { customer_Id, redeemProductId } = req.body;
  
    try {
      const customer = await Customer.findById(customer_Id);
      const product = await CustomerRedeemProduct.findById(redeemProductId);
  
      if (!customer || !product) {
        return res.status(404).json({ message: 'Customer or Product not found' });
      }
  
      if (customer.points < product.requiredPoints) {
        return res.status(400).json({ message: 'Not enough points to redeem this product' });
      }
  
      // Deduct points
      customer.points -= product.requiredPoints;
      await customer.save();
  
      // Save redemption history
      const redemption = new CustomerRedemptionHistory({
        customer_Id: customer._id,
        redeemProductId: product._id,
        pointsDeducted: product.requiredPoints
      });
      await redemption.save();
  
      // ✅ Add points transaction
      await CustomerPointsTransactions.create({
        customer: customer._id,
        points: -product.requiredPoints, // 👈 Negative points for deduction
        type: "redeem",
        description: `Redeemed product: ${product.name}`
      });
  
      res.status(200).json({ message: 'Product redeemed successfully', redemption });
    } catch (err) {
      res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
  };
  

// Get redemption history with farmer & redeem product details
const getRedeemProductHistoryCustomer = async (req, res) => {
    try {
        const history = await CustomerRedemptionHistory.find()
            .sort({ redeemedAt: -1 })
            .populate({
                path: 'customer_Id',
                select: 'name _id referralCode points'
            })
            .populate({
                path: 'redeemProductId',
                select: 'name _id requiredPoints'
            });

        const formattedHistory = history.map(entry => ({
            customer_Id: entry.customer_Id?._id,
            customerName: entry.customer_Id?.name,
            referralCode: entry.customer_Id?.referralCode,
            totalPoints: entry.customer_Id?.points,
            redeemProductId: entry.redeemProductId?._id,
            redeemProductName: entry.redeemProductId?.name,
            pointsDeducted: entry.pointsDeducted,
            redeemedAt: entry.redeemedAt
        }));

        res.status(200).json(formattedHistory);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



// Get customer redemption history by customer ID
const getRedeemProductsByCustomerId = async (req, res) => {
    const { customerId } = req.params;

    try {
        const history = await CustomerRedemptionHistory.find({ customer_Id: customerId })
            .sort({ redeemedAt: -1 })
            .populate({
                path: 'redeemProductId',
                select: 'name rc_product_img requiredPoints description'
            });

        const formattedHistory = history.map(entry => ({
            redeemProductId: entry.redeemProductId?._id,
            redeemProductName: entry.redeemProductId?.name,
            productImg: entry.redeemProductId?.rc_product_img,
            requiredPoints: entry.redeemProductId?.requiredPoints,
            description: entry.redeemProductId?.description,
            pointsDeducted: entry.pointsDeducted,
            redeemedAt: entry.redeemedAt
        }));

        res.status(200).json(formattedHistory);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



// Get farmer redemption history by farmer ID
const getRedeemProductsByFarmerId = async (req, res) => {
    const { farmerId } = req.params;

    try {
        const history = await RedemptionHistory.find({ farmerId: farmerId })
            .sort({ redeemedAt: -1 })
            .populate({
                path: 'redeemProductId',
                select: 'name r_product_img requiredPoints description'
            });

        const formattedHistory = history.map(entry => ({
            redeemProductId: entry.redeemProductId?._id,
            redeemProductName: entry.redeemProductId?.name,
            productImg: entry.redeemProductId?.r_product_img,
            requiredPoints: entry.redeemProductId?.requiredPoints,
            description: entry.redeemProductId?.description,
            pointsDeducted: entry.pointsDeducted,
            redeemedAt: entry.redeemedAt
        }));

        res.status(200).json(formattedHistory);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


module.exports = {
    addRedeemProductCustomer,
    getAllRedeemProductsCustomer,
    updateCustomerRedeemProduct,
    deleteCustomerRedeemProduct,
    redeemProductCustomer,
    getRedeemProductHistoryCustomer,
    getRedeemProductsByCustomerId,
    getRedeemProductsByFarmerId
};



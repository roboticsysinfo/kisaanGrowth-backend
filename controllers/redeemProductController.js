const Farmer = require('../models/Farmer');
const RedeemProduct = require('../models/RedeemProduct');
const RedemptionHistory = require('../models/RedemptionHistory');


// Add redeem product
const createRedeemProduct = async (req, res) => {
    try {
        const { name, description, requiredPoints } = req.body;
        const r_product_img = req.file ? req.file.path : null;

        if (!name || !description || !requiredPoints) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const product = new RedeemProduct({
            name,
            description,
            requiredPoints,
            r_product_img
        });

        await product.save();
        res.status(201).json({ message: 'Redeem product created successfully', product });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


// get all redeem products
const getAllRedeemProducts = async (req, res) => {
    try {
        const products = await RedeemProduct.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

//update
const updateRedeemProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, requiredPoints } = req.body;
        const r_product_img = req.file ? req.file.path : undefined;

        const product = await RedeemProduct.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.name = name || product.name;
        product.description = description || product.description;
        product.requiredPoints = requiredPoints || product.requiredPoints;
        if (r_product_img) product.r_product_img = r_product_img;

        await product.save();
        res.status(200).json({ message: 'Redeem product updated', product });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// delete
const deleteRedeemProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await RedeemProduct.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Redeem product deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};



// Redeem Product
const redeemProduct = async (req, res) => {
    const { farmerId, redeemProductId } = req.body;

    try {
        const farmer = await Farmer.findById(farmerId);
        const product = await RedeemProduct.findById(redeemProductId);

        if (!farmer || !product) {
            return res.status(404).json({ message: 'Farmer or Product not found' });
        }

        if (farmer.points < product.requiredPoints) {
            return res.status(400).json({ message: 'Not enough points to redeem this product' });
        }

        // Deduct points
        farmer.points -= product.requiredPoints;
        await farmer.save();

        // Save redemption history
        const redemption = new RedemptionHistory({
            farmerId: farmer._id,
            redeemProductId: product._id
        });
        await redemption.save();

        res.status(200).json({ message: 'Product redeemed successfully', redemption });
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
};


module.exports = {
    createRedeemProduct,
    getAllRedeemProducts,
    updateRedeemProduct,
    deleteRedeemProduct
};



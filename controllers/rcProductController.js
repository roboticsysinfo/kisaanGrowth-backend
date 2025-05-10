
const Customer = require("../models/Customer")
const CustomerPointsTransactions = require('../models/customerPointsTransactions');
const CustomerRedeemBill = require("../models/CustomerRedeemBill");
const CustomerRedeemProduct = require("../models/CustomerRedeemProduct")
const CustomerRedemptionHistory = require("../models/CustomerRedeemptionHistory");
const RedemptionHistory = require("../models/RedemptionHistory");
const generateCustomerBillPdf = require("../utils/generateCustomerBillPdf");
const imagekit = require("../utils/imagekit");
const fs = require("fs")
const path = require('path');


// Add redeem product

const addRedeemProductCustomer = async (req, res) => {

    try {

        const { name, description, requiredPoints, price_value } = req.body;
        const file = req.file;

        if (!name || !description || !requiredPoints || !price_value || !file) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Upload to ImageKit using memory buffer
        const uploadResponse = await imagekit.upload({
            file: file.buffer, // ✅ buffer used instead of path
            fileName: file.originalname,
            folder: "/uploads",
        });

        const product = new CustomerRedeemProduct({
            name,
            description,
            requiredPoints,
            price_value,
            rc_product_img: uploadResponse.url
        });

        await product.save();
        res.status(201).json({ message: 'Redeem product created successfully', product });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


//update
const updateCustomerRedeemProduct = async (req, res) => {

    try {

        const { id } = req.params;
        const { name, description, requiredPoints, price_value } = req.body;
        const file = req.file;

        const product = await CustomerRedeemProduct.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let newImageUrl = product.rc_product_img;

        if (file) {
            const uploadResponse = await imagekit.upload({
                file: file.buffer, // ✅ buffer instead of path
                fileName: file.originalname,
                folder: "/uploads",
            });
            newImageUrl = uploadResponse.url;
        }

        product.name = name || product.name;
        product.description = description || product.description;
        product.requiredPoints = requiredPoints || product.requiredPoints;
        product.price_value = price_value || product.price_value;
        product.rc_product_img = newImageUrl;

        await product.save();
        res.status(200).json({ message: 'Redeem product updated', product });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }

};


const getAllRedeemProductsCustomer = async (req, res) => {
    try {
        const products = await CustomerRedeemProduct.find().sort({ createdAt: -1 });
        res.status(200).json(products);
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
// const redeemProductCustomer = async (req, res) => {
//     const { customer_Id, redeemProductId } = req.body;

//     try {
//         const customer = await Customer.findById(customer_Id);
//         const product = await CustomerRedeemProduct.findById(redeemProductId);

//         if (!customer || !product) {
//             return res.status(404).json({ message: 'Customer or Product not found' });
//         }

//         if (customer.points < product.requiredPoints) {
//             return res.status(400).json({ message: 'Not enough points to redeem this product' });
//         }

//         // Deduct points
//         customer.points -= product.requiredPoints;
//         await customer.save();

//         // Save redemption history
//         const redemption = new CustomerRedemptionHistory({
//             customer_Id: customer._id,
//             redeemProductId: product._id,
//             pointsDeducted: product.requiredPoints
//         });
//         await redemption.save();

//         // ✅ Add points transaction
//         await CustomerPointsTransactions.create({
//             customer: customer._id,
//             points: -product.requiredPoints, // 👈 Negative points for deduction
//             type: "redeem",
//             description: `Redeemed product: ${product.name}`
//         });

//         res.status(200).json({ message: 'Product redeemed successfully', redemption });
//     } catch (err) {
//         res.status(500).json({ message: 'Something went wrong', error: err.message });
//     }
// };


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

        // Generate unique Order ID (format: ORD + timestamp + random)
        const orderId = 'ORD' + Date.now() + Math.floor(1000 + Math.random() * 9000);

        // Save redemption history
        const redemption = new CustomerRedemptionHistory({
            customer_Id: customer._id,
            redeemProductId: product._id,
            pointsDeducted: product.requiredPoints,
            orderId // 👈 new field
        });
        await redemption.save();

        // ✅ Add points transaction
        await CustomerPointsTransactions.create({
            customer: customer._id,
            points: -product.requiredPoints, // 👈 Negative points for deduction
            type: "redeem",
            description: `Redeemed product: ${product.name}`
        });

        // After saving redemption
        const priceValue = product.price_value || 0; // get product price
        const gstAmount = +(priceValue * 0.18).toFixed(2); // 18% GST
        const totalAmount = +(priceValue + gstAmount).toFixed(2);

        // Save Bill
        await CustomerRedeemBill.create({
            customer_Id: customer._id,
            redeemProductId: product._id,
            orderId,
            productName: product.name,
            priceValue,
            gstAmount,
            totalAmount
        });

        const billFileName = `invoice_${orderId}.pdf`;
        const billPath = path.join(__dirname, '../uploads/bills', billFileName);

        await generateCustomerBillPdf({
            ...bill.toObject(), // all bill data
            orderId
        }, billPath);

        // Optionally, save file path in bill model:
        bill.pdfPath = `bills/${billFileName}`;
        await bill.save();


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


const getBillPdf = async (req, res) => {
    const { orderId } = req.params;

    try {
        const bill = await CustomerRedeemBill.findOne({ orderId });
        if (!bill || !bill.pdfPath) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        const filePath = path.join(__dirname, '..', bill.pdfPath);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${orderId}.pdf"`);
        fs.createReadStream(filePath).pipe(res);
    } catch (err) {
        res.status(500).json({ message: 'Error generating bill', error: err.message });
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
    getRedeemProductsByFarmerId,
    getBillPdf
};




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

//         // Generate unique Order ID
//         const orderId = 'ORD' + Date.now() + Math.floor(1000 + Math.random() * 9000);

//         // Save redemption history
//         const redemption = new CustomerRedemptionHistory({
//             customer_Id: customer._id,
//             redeemProductId: product._id,
//             pointsDeducted: product.requiredPoints,
//             orderId
//         });
//         await redemption.save();

//         // Add points transaction
//         await CustomerPointsTransactions.create({
//             customer: customer._id,
//             points: -product.requiredPoints,
//             type: "redeem",
//             description: `Redeemed product: ${product.name}`
//         });

//         // Calculate billing amounts
//         const priceValue = product.price_value || 0;
//         const gstAmount = +(priceValue * 0.18).toFixed(2);
//         const totalAmount = +(priceValue + gstAmount).toFixed(2);


//         // Create bill document
//         const bill = new CustomerRedeemBill({
//             customer_Id: customer._id,
//             redeemProductId: product._id,
//             orderId,
//             productName: product.name,
//             priceValue,
//             gstAmount,
//             totalAmount
//         });

//         await bill.save();

//         // Generate PDF
//         const billFileName = `invoice_${orderId}.pdf`;
//         const billPath = path.join(__dirname, '../uploads/bills', billFileName);

//         await generateCustomerBillPdf({
//             orderId,
//             productName: product.name,
//             priceValue,
//             gstAmount,
//             totalAmount,
//             billGeneratedAt: bill.billGeneratedAt,
//             customer_Id: customer._id.toString(),

//             customerName: customer.name,
//             customerAddress: customer.address,
//             customerState: customer.state,
//             customerCity: customer.city,
//             customerPhone: customer.phoneNumber

//         }, billPath);

//         // DEBUG: Check before update
//         console.log("✅ Bill PDF Generated:", billFileName);

//         // Update pdfPath forcefully using findByIdAndUpdate
//         const updated = await CustomerRedeemBill.findByIdAndUpdate(
//             bill._id,
//             { pdfPath: `bills/${billFileName}` },
//             { new: true } // Return updated document
//         );


//         res.status(200).json({
//             message: 'Product redeemed successfully',
//             redemption,
//             bill: {
//                 orderId,
//                 totalAmount,
//                 pdf: updated.pdfPath
//             }
//         });

//     } catch (err) {
//         console.error("❌ Error redeeming product:", err);
//         res.status(500).json({ message: 'Something went wrong', error: err.message });
//     }
// };

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

        // Generate unique Order ID
        const orderId = 'ORD' + Date.now() + Math.floor(1000 + Math.random() * 9000);

        // Save redemption history
        const redemption = new CustomerRedemptionHistory({
            customer_Id: customer._id,
            redeemProductId: product._id,
            pointsDeducted: product.requiredPoints,
            orderId
        });
        await redemption.save();

        // Add points transaction
        await CustomerPointsTransactions.create({
            customer: customer._id,
            points: -product.requiredPoints,
            type: "redeem",
            description: `Redeemed product: ${product.name}`
        });

        // Calculate billing amounts
        const priceValue = product.price_value || 0;
        const gstAmount = +(priceValue * 0.18).toFixed(2);
        const totalAmount = +(priceValue + gstAmount).toFixed(2);

        // Create bill document
        const bill = new CustomerRedeemBill({
            customer_Id: customer._id,
            redeemProductId: product._id,
            orderId,
            productName: product.name,
            priceValue,
            gstAmount,
            totalAmount
        });

        await bill.save();

        // Update PDF path in the bill
        const billFileName = `invoice_${orderId}.pdf`;
        const updated = await CustomerRedeemBill.findByIdAndUpdate(
            bill._id,
            { pdfPath: `bills/${billFileName}` },
            { new: true } // Return updated document
        );

        res.status(200).json({
            message: 'Product redeemed successfully',
            redemption,
            bill: {
                orderId,
                totalAmount,
                pdf: updated.pdfPath
            }
        });

    } catch (err) {
        console.error("❌ Error redeeming product:", err);
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
                select: 'name _id requiredPoints orderId'
            });

        const formattedHistory = history.map(entry => ({
            customer_Id: entry.customer_Id?._id,
            customerName: entry.customer_Id?.name,
            referralCode: entry.customer_Id?.referralCode,
            totalPoints: entry.customer_Id?.points,
            redeemProductId: entry.redeemProductId?._id,
            redeemProductName: entry.redeemProductId?.name,
            pointsDeducted: entry.pointsDeducted,
            orderId: entry.orderId,
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

    console.log("customer id", customerId)

    try {
        const history = await CustomerRedemptionHistory.find({ customer_Id: customerId })
            .sort({ redeemedAt: -1 })
            .populate({
                path: 'redeemProductId',
                select: 'name rc_product_img requiredPoints description orderId'
            });

        console.log("history", history)

        const formattedHistory = history.map(entry => ({
            redeemProductId: entry.redeemProductId?._id,
            redeemProductName: entry.redeemProductId?.name,
            productImg: entry.redeemProductId?.rc_product_img,
            requiredPoints: entry.redeemProductId?.requiredPoints,
            description: entry.redeemProductId?.description,
            pointsDeducted: entry.pointsDeducted,
            orderId: entry.orderId,
            redeemedAt: entry.redeemedAt
        }));

        console.log("formattedHistory", formattedHistory)

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
    console.log("🔍 Requested orderId:", orderId);

    try {
        const bill = await CustomerRedeemBill.findOne({ orderId });

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found in database' });
        }

        // Fallback file path logic
        const pdfRelativePath = bill.pdfPath || `bills/invoice_${orderId}.pdf`;
        const filePath = path.resolve(__dirname, '../uploads', pdfRelativePath);

        console.log("📁 Looking for file at:", filePath);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'PDF file not found on server', path: filePath });
        }

        // Serve the file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${orderId}.pdf"`);

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        fileStream.on('error', (err) => {
            console.error("❌ Stream error:", err);
            res.status(500).json({ message: 'Error reading file', error: err.message });
        });

    } catch (err) {
        console.error("❌ Server error while serving bill:", err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// Get customer invoice details by order ID
const getCustomerInvoiceDetails = async (req, res) => {
    const { orderId } = req.params;

    try {
        // Fetch the bill document by orderId
        const bill = await CustomerRedeemBill.findOne({ orderId })
            .populate({
                path: 'customer_Id',
                select: 'name address phoneNumber email'
            })
            .populate({
                path: 'redeemProductId',
                select: 'name price_value requiredPoints description'
            });

        // Check if bill exists
        if (!bill) {
            return res.status(404).json({ message: 'Invoice not found for the given order ID' });
        }

        // Prepare the invoice details
        const invoiceDetails = {
            orderId: bill.orderId,
            customer: {
                name: bill.customer_Id.name,
                address: bill.customer_Id.address,
                phoneNumber: bill.customer_Id.phoneNumber,
                email: bill.customer_Id.email,
            },
            product: {
                name: bill.redeemProductId.name,
                priceValue: bill.priceValue,
                requiredPoints: bill.redeemProductId.requiredPoints,
                description: bill.redeemProductId.description,
            },
            gstAmount: bill.gstAmount,
            totalAmount: bill.totalAmount,
            redeemedAt: bill.redeemedAt,
            pdfPath: bill.pdfPath
        };

        res.status(200).json({ invoiceDetails });
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
    getRedeemProductsByFarmerId,
    getBillPdf,
    getCustomerInvoiceDetails
};



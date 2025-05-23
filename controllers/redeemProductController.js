const Farmer = require('../models/Farmer');
const FarmerRedeemBill = require('../models/FarmerRedeemBill');
const pointsTransactionHistory = require('../models/pointsTransactionHistory');
const RedeemProduct = require('../models/RedeemProduct');
const RedemptionHistory = require('../models/RedemptionHistory');
const generateFarmerBillPdf = require('../utils/generateFarmerBillPdf');
const imagekit = require('../utils/imagekit');
const fs = require("fs")
const path = require('path');


// Add redeem product

const createRedeemProduct = async (req, res) => {

    try {

        const { name, description, requiredPoints, price_value } = req.body;
        const r_product_img = req.file ? req.file : null;

        if (!name || !description || !requiredPoints) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (r_product_img) {
            // Upload image to ImageKit
            const file = r_product_img.buffer; // file buffer from multer

            // Upload to ImageKit
            const uploadResult = await imagekit.upload({
                file: file,
                fileName: r_product_img.originalname,
                folder: "/uploads", // Specify folder if needed
            });

            // Get the URL of the uploaded image
            const imageUrl = uploadResult.url;

            // Create the product with the URL of the image
            const product = new RedeemProduct({
                name,
                description,
                requiredPoints,
                price_value,
                r_product_img: imageUrl, // Store the ImageKit URL here
            });

            await product.save();
            return res.status(201).json({ message: 'Redeem product created successfully', product });

        } else {
            return res.status(400).json({ message: "Product image is required" });
        }
        
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

        const { name, description, requiredPoints, price_value } = req.body;
        const r_product_img = req.file ? req.file : undefined; // File uploaded via Multer

        const product = await RedeemProduct.findById(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Handle image update if a new image is uploaded
        if (r_product_img) {
            const file = r_product_img.buffer; // Multer buffer

            // Upload the image to ImageKit
            const uploadResult = await imagekit.upload({
                file: file,
                fileName: r_product_img.originalname,
                folder: "/uploads", // Optional: Set the folder name in ImageKit
            });

            // Get the ImageKit URL for the new image
            const newImageUrl = uploadResult.url;

            // Update the image URL in the product document
            product.r_product_img = newImageUrl;

        }

        // Update other fields (name, description, requiredPoints)
        product.name = name || product.name;
        product.description = description || product.description;
        product.price_value = price_value || product.price_value;
        product.requiredPoints = requiredPoints || product.requiredPoints;

        // Save the updated product
        await product.save();

        res.status(200).json({ message: 'Redeem product updated successfully', product });

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

// Redeem Product farmer
// const redeemProduct = async (req, res) => {

//     const { farmerId, redeemProductId } = req.body;

//     try {

//       const farmer = await Farmer.findById(farmerId);
//       const product = await RedeemProduct.findById(redeemProductId);

//       if (!farmer || !product) {
//         return res.status(404).json({ message: 'Farmer or Product not found' });
//       }
  
//       if (farmer.points < product.requiredPoints) {
//         return res.status(400).json({ message: 'Not enough points to redeem this product' });
//       }
  
//       // Deduct points
//       farmer.points -= product.requiredPoints;
//       await farmer.save();

//       // Save redemption history
//       const redemption = new RedemptionHistory({
//         farmerId: farmer._id,
//         redeemProductId: product._id,
//         pointsDeducted: product.requiredPoints
//       });
//       await redemption.save();

//       // ✅ Add points transaction
//       await pointsTransactionHistory.create({
//         farmer: farmer._id,
//         points: -product.requiredPoints, // 👈 Negative points for deduction
//         type: "redeem",
//         description: `Redeemed product: ${product.name}`
//       });
      
//       res.status(200).json({ message: 'Product redeemed successfully', redemption });
//     } catch (err) {
//       res.status(500).json({ message: 'Something went wrong', error: err.message });
//     }
//   };


// const redeemProduct = async (req, res) => {

//     const { farmerId, redeemProductId } = req.body;

//     try {

//         const farmer = await Farmer.findById(farmerId);
//         const product = await RedeemProduct.findById(redeemProductId);

//         if (!farmer || !product) {
//             return res.status(404).json({ message: 'Farmer or Product not found' });
//         }


//         if (farmer.points < product.requiredPoints) {
//             return res.status(400).json({ message: 'Not enough points to redeem this product' });
//         }


//         // Deduct points
//         farmer.points -= product.requiredPoints;
//         await farmer.save();


//         // Generate unique Order ID
//         const orderId = 'ORD' + Date.now() + Math.floor(1000 + Math.random() * 9000);


//         // Save redemption history
//         const redemption = new RedemptionHistory({
//             farmerId: farmer._id,
//             redeemProductId: product._id,
//             pointsDeducted: product.requiredPoints,
//             orderId
//         });
//         await redemption.save();

//         // Add points transaction
//         await pointsTransactionHistory.create({
//             farmer: farmer._id,
//             points: -product.requiredPoints,
//             type: "redeem",
//             description: `Redeemed product: ${product.name}`
//         });

//         // Calculate billing amounts
//         const priceValue = product.price_value || 0;
//         const gstAmount = +(priceValue * 0.18).toFixed(2);
//         const totalAmount = +(priceValue + gstAmount).toFixed(2);

//         // Create bill document
//         const bill = new FarmerRedeemBill({
//             farmerId: farmer._id,
//             redeemProductId: product._id,
//             orderId,
//             productName: product.name,
//             priceValue,
//             gstAmount,
//             totalAmount
//         });

//         await bill.save();

//         // Generate PDF
//         const billFileName = `farmer_invoice_${orderId}.pdf`;
//         const billPath = path.join(__dirname, '../uploads/bills', billFileName);

//         await generateFarmerBillPdf({
//             orderId,
//             productName: product.name,
//             priceValue,
//             gstAmount,
//             totalAmount,
//             billGeneratedAt: bill.billGeneratedAt,
//             farmerId: farmer._id.toString(),

//             farmerName: farmer.name,
//             farmerAddress: farmer.address,
//             farmerState: farmer.state,
//             farmerCity: farmer.city_district,
//             farmerPhone: farmer.phoneNumber
//         }, billPath);

//         // Update pdfPath
//         const updated = await FarmerRedeemBill.findByIdAndUpdate(
//             bill._id,
//             { pdfPath: `bills/${billFileName}` },
//             { new: true }
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

        // Generate unique Order ID
        const orderId = 'ORD' + Date.now() + Math.floor(1000 + Math.random() * 9000);

        // Save redemption history
        const redemption = new RedemptionHistory({
            farmerId: farmer._id,
            redeemProductId: product._id,
            pointsDeducted: product.requiredPoints,
            orderId
        });
        await redemption.save();

        // Add points transaction
        await pointsTransactionHistory.create({
            farmer: farmer._id,
            points: -product.requiredPoints,
            type: "redeem",
            description: `Redeemed product: ${product.name}`
        });

        // Calculate billing amounts
        const priceValue = product.price_value || 0;
        const gstAmount = +(priceValue * 0.18).toFixed(2);
        const totalAmount = +(priceValue + gstAmount).toFixed(2);

        // Save bill data (without generating PDF)
        const bill = new FarmerRedeemBill({
            farmerId: farmer._id,
            redeemProductId: product._id,
            orderId,
            productName: product.name,
            priceValue,
            gstAmount,
            totalAmount
        });

        await bill.save();

        res.status(200).json({
            message: 'Product redeemed successfully',
            redemption,
            bill: {
                orderId,
                priceValue,
                gstAmount,
                totalAmount
            }
        });

    } catch (err) {
        console.error("❌ Error redeeming product:", err);
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
};



// Get redemption history with farmer & redeem product details

const getRedeemProductHistoryFarmer = async (req, res) => {
    
    try {

        const history = await RedemptionHistory.find()

            .sort({ redeemedAt: -1 })
            .populate({
                path: 'farmerId',
                select: 'name _id referralCode points'
            })
            .populate({
                path: 'redeemProductId',
                select: 'name _id requiredPoints orderId'
            });

        const formattedHistory = history.map(entry => ({
            farmerId: entry.farmerId?._id,
            farmerName: entry.farmerId?.name,
            referralCode: entry.farmerId?.referralCode,
            totalPoints: entry.farmerId?.points,
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


const getFarmerBillPdf = async (req, res) => {
    const { orderId } = req.params;
    try {
        const bill = await FarmerRedeemBill.findOne({ orderId });

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found in database' });
        }

        // Fallback file path logic
        const pdfRelativePath = bill.pdfPath || `bills/farmer_invoice_${orderId}.pdf`;
        const filePath = path.resolve(__dirname, '../uploads', pdfRelativePath);

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



module.exports = {
    createRedeemProduct,
    getAllRedeemProducts,
    updateRedeemProduct,
    deleteRedeemProduct,
    redeemProduct,
    getRedeemProductHistoryFarmer,
    getFarmerBillPdf
};



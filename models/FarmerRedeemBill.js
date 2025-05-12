const mongoose = require('mongoose');

const farmerRedeemBillSchema = new mongoose.Schema({

    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer',
        required: true
    },

    redeemProductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RedeemProduct',
        required: true
    },
    orderId: { type: String, required: true, unique: true },
    pdfPath: {
        type: String,
    },
    productName: {
        type: String,
        required: true
    },

    priceValue: {
        type: Number,
        required: true
    },

    gstAmount: {
        type: Number,
        required: true
    },

    totalAmount: {
        type: Number,
        required: true
    },

    billGeneratedAt: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true });


module.exports = mongoose.model('FarmerRedeemBill', farmerRedeemBillSchema);

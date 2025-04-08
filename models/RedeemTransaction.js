// models/RedeemTransaction.js
const redeemTransactionSchema = new mongoose.Schema({

    farmer: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Farmer'
    },

    redeemProduct: {
        type: mongoose.Schema.Types.ObjectId, ref: 'RedeemProduct'
    },

    redeemedAt: { type: Date, default: Date.now },

}, { timestamps: true });

module.exports = mongoose.model('RedeemTransaction', redeemTransactionSchema);
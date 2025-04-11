// models/FarmerTip.js
const mongoose = require('mongoose');

const farmingTipsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  youtubeLink: { type: String, required: true },
},
{
    timestamps: true
}
);

module.exports = mongoose.model('FarmingTips', farmingTipsSchema);

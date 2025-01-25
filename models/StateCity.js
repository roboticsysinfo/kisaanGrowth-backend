const mongoose = require('mongoose');

const stateCitySchema = new mongoose.Schema({
  state: {
    type: String,
    required: true, // state is required
  },
  districts: {
    type: [String], // Array of district names
    required: true, // districts is also required
  },
});

const StateCity = mongoose.model('StateCity', stateCitySchema);

module.exports = StateCity;

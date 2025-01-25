// In your Express routes (for example, stateCityRoutes.js)

const express = require('express');
const router = express.Router();
const StateCity = require('../models/StateCity'); // Import the StateCity model

// Endpoint to get all states and districts
router.get('/states-cities', async (req, res) => {
  try {
    const states = await StateCity.find();
    res.json(states);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching states', error });
  }
});

module.exports = router;

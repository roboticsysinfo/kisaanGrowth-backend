const Farmer = require('../models/Farmer');
const Customer = require('../models/Customer');

exports.saveFcmToken = async (req, res) => {
  try {
    const { userId, type, token } = req.body;

    if (!userId || !type || !token) {
      return res.status(400).json({ message: 'Missing data' });
    }

    if (type === 'farmer') {
      await Farmer.findByIdAndUpdate(userId, { fcmToken: token });
    } else if (type === 'customer') {
      await Customer.findByIdAndUpdate(userId, { fcmToken: token });
    } else {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    res.status(200).json({ message: 'FCM token saved successfully' });
  } catch (err) {
    console.error('Error saving FCM token:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

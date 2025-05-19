const express = require('express');
const router = express.Router();
const { saveFcmToken } = require('../controllers/fcmController');

router.post('/save-fcm-token', saveFcmToken);

module.exports = router;

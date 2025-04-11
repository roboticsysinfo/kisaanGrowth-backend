const express = require('express');
const router = express.Router();
const FarmingTipsController = require('../controllers/FarmingTipsController');
const {authorize} = require("../middlewares/authMiddleware")


// Create a tip
router.post('/farming-tip/add', authorize(["admin"]), FarmingTipsController.createTip);


// Get all tips
router.get('/farming-tips/get', authorize(["farmer", "admin"]), FarmingTipsController.getTips);


// Update a tip
router.put('/farming-tip/update/:id', authorize(["admin"]), FarmingTipsController.updateTip);


// Delete a tip
router.delete('/farming-tip/delete/:id', authorize(["admin"]), FarmingTipsController.deleteTip);


module.exports = router;

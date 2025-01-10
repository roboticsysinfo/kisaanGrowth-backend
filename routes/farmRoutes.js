const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { createFarm, getAllFarms, getFarmById, updateFarm, deletedFarm } = require('../controllers/farmController');


// Create Farm Route 
router.post('/create-farm', protect(['admin', 'farmer', 'sub_admin']), createFarm); 
// Get All Farms
router.get('/farms', protect, getAllFarms);  
// Get Farm by Id
router.get('/farm/:id', protect(['admin', 'farmer', 'sub_admin']), getFarmById);
// Update Farm 
router.put('/farm/:id', protect(['admin', 'farmer', 'sub_admin']), updateFarm); 
// Delete Farm
router.delete('/farm/:id', protect(['admin', 'farmer', 'sub_admin']),  deletedFarm); 

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { createCrop, getAllCrops, updateCrop, deleteCrop, getCropById } = require('../controllers/cropController');



router.post('/create-crop', protect(['admin', 'farmer', 'sub_admin']), createCrop); 
router.get('/crops', protect, getAllCrops);  
router.get('/crop/:id', protect(['admin', 'farmer', 'sub_admin']), getCropById); 
router.put('/crop/:id', protect(['admin', 'farmer', 'sub_admin']), updateCrop); 
router.delete('/crop/:id', protect(['admin', 'farmer', 'sub_admin']),  deleteCrop); 

module.exports = router;

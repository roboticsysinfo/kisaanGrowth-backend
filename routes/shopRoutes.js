const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { createShop, getAllShops, getShopById, deleteShop, updateShop } = require('../controllers/shopController');


router.post('/create-shop', protect(['farmer','admin', 'sub_admin']), createShop); 
router.get('/shops', protect, getAllShops); 
router.get('/shop/:id', protect, getShopById); 
router.put('/shop/:id', protect(['admin', 'farmer', 'sub_admin']), updateShop); 
router.delete('/shop/:id', protect(['admin', 'farmer', 'sub_admin']),  deleteShop); 

module.exports = router;

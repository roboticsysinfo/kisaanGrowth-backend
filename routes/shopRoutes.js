const express = require('express');
const router = express.Router();
const { authorize } = require('../middlewares/authMiddleware');
const { createShop, getAllShops, getShopById, deleteShop, updateShop, upload } = require('../controllers/shopController');


router.post('/create-shop', upload.fields([{ name: 'shop_image' }, { name: 'certification_image' }]), authorize(['farmer','admin', 'sub_admin']), createShop); 
router.get('/shops', getAllShops); 
router.get('/shop/:id', authorize, getShopById); 
router.put('/shop/:id', upload.fields([{ name: 'shop_image' }, { name: 'certification_image' }]), authorize(['admin', 'farmer', 'sub_admin']), updateShop); 
router.delete('/shop/:id', authorize(['admin', 'farmer', 'sub_admin']),  deleteShop); 




module.exports = router;

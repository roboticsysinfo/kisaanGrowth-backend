const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, getProductsBySubCategory } = require('../controllers/productController');



router.post('/create-product', protect(['admin', 'farmer', 'sub_admin']), createProduct); 
router.get('/products', getAllProducts);  
router.get('/product/:id', protect(['admin', 'farmer', 'sub_admin']), getProductById); 
router.put('/product/:id', protect(['admin', 'farmer', 'sub_admin']), updateProduct); 
router.delete('/product/:id', protect(['admin', 'farmer', 'sub_admin']),  deleteProduct); 
router.get('/product/sub-category/:id', protect, getProductsBySubCategory)

module.exports = router;

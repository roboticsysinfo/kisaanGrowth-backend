const express = require('express');
const router = express.Router();
const { authorize } = require('../middlewares/authMiddleware');
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, getProductsBySubCategory, getProductByFarmerId } = require('../controllers/productController');
const upload = require('../middlewares/upload');


router.post('/create-product', upload.single('product_image'), authorize([ 'farmer']), createProduct); 
router.get('/products', getAllProducts);  
router.get('/product/:id', authorize(['admin', 'customer', 'sub_admin']), getProductById); 
router.put('/product/:id', authorize(['admin', 'farmer', 'sub_admin']), updateProduct); 
router.delete('/product/:id', authorize(['admin', 'farmer', 'sub_admin']),  deleteProduct); 
router.get('/farmer-products/:id', authorize(['admin', 'farmer', 'sub_admin']), getProductByFarmerId)
router.get('/product/sub-category/:id', authorize, getProductsBySubCategory)

module.exports = router;

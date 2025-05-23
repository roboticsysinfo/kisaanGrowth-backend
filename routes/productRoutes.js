const express = require('express');
const router = express.Router();
const { authorize } = require('../middlewares/authMiddleware');
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, getProductByFarmerId, getProductsByCategory, getProductsByCity, getProductsByCategoryLocation } = require('../controllers/productController');
const upload = require('../middlewares/upload');


router.post('/create-product', upload.single('product_image'), authorize([ 'farmer']), createProduct); 


router.get('/products', getAllProducts);  


router.get('/product/:id', getProductById); 


router.put('/product/:id', upload.single('product_image'), authorize(['admin', 'farmer', 'sub_admin']), updateProduct); 


router.delete('/product/:id', authorize(['admin', 'farmer', 'sub_admin']),  deleteProduct); 


router.get('/farmer-products/:id', authorize(['admin', 'farmer']), getProductByFarmerId)


router.get('/products/category/:categoryId', getProductsByCategory)


// routes/productRoutes.js
router.get("/products/bycity", getProductsByCity);


router.get('/products/category-and-location/:categoryId', getProductsByCategoryLocation)

module.exports = router;

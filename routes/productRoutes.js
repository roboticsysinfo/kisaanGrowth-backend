const express = require('express');
const router = express.Router();
const { authorize } = require('../middlewares/authMiddleware');
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, getProductByFarmerId, getProductsByCategory, getProductsByCity } = require('../controllers/productController');
const upload = require('../middlewares/upload');


router.post('/create-product', upload.single('product_image'), authorize([ 'farmer']), createProduct); 


router.get('/products', getAllProducts);  


router.get('/product/:id', getProductById); 


router.put('/product/:id', authorize(['admin', 'farmer', 'sub_admin']), updateProduct); 


router.delete('/product/:id', authorize(['admin', 'farmer', 'sub_admin']),  deleteProduct); 


router.get('/farmer-products/:id', authorize(['admin', 'farmer']), getProductByFarmerId)



router.get('/products/category/:categoryId', getProductsByCategory)



// routes/productRoutes.js
router.get("/products/bycity", getProductsByCity);


module.exports = router;

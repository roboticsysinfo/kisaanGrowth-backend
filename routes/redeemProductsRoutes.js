const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload'); // multer upload middleware
const {
  createRedeemProduct,
  getAllRedeemProducts,
  updateRedeemProduct,
  deleteRedeemProduct,
  redeemProduct
} = require('../controllers/redeemProductController');


// Add Product
router.post('/add-redeem-product', upload.single('r_product_img'), createRedeemProduct);

// Get All
router.get('/redeem-products', getAllRedeemProducts);

// Update Product
router.put('/update-redeem-product/:id', upload.single('r_product_img'), updateRedeemProduct);

// Delete Product
router.delete('/delete-redeem-product/:id', deleteRedeemProduct);


// Redeem Product
router.post('/redeem-product', redeemProduct);


module.exports = router;

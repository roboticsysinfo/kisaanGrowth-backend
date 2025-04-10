const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload'); // multer upload middleware
const {
  createRedeemProduct,
  getAllRedeemProducts,
  updateRedeemProduct,
  deleteRedeemProduct,
  redeemProduct,
  getRedeemProductHistoryFarmer
} = require('../controllers/redeemProductController');
const { authorize } = require('../middlewares/authMiddleware');


// Add Product
router.post('/add-redeem-product', authorize(["admin"]), upload.single('r_product_img'), createRedeemProduct);


// Get All
router.get('/redeem-products', authorize(["farmer"]), getAllRedeemProducts);


// Update Product
router.put('/update-redeem-product/:id', authorize(["admin"]), upload.single('r_product_img'), updateRedeemProduct);


// Delete Product
router.delete('/delete-redeem-product/:id', authorize(["admin"]), deleteRedeemProduct);


// Redeem Product by farmer
router.post('/redeem-product', authorize(["farmer"]), redeemProduct);


// Redeem Product by farmers history
router.get('/farmer/redeem-product-history', authorize(["admin"]), getRedeemProductHistoryFarmer);


module.exports = router;

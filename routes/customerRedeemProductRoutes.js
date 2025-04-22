const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload'); // multer upload middleware
const {
    getRedeemProductHistoryCustomer,
    getAllRedeemProductsCustomer,
    redeemProductCustomer,
    deleteCustomerRedeemProduct,
    updateCustomerRedeemProduct,
    addRedeemProductCustomer,
    getRedeemProductsByCustomerId
} = require("../controllers/rcProductController")
const { authorize } = require('../middlewares/authMiddleware');


// Add Product
router.post('/customer/add-redeem-product', authorize(["admin"]), upload.single('rc_product_img'), addRedeemProductCustomer);

// Get All
router.get('/get/customer/redeem-products', authorize(["customer", "admin"]), getAllRedeemProductsCustomer);


// Update Product
router.put('/customer/update-redeem-product/:id', authorize(["admin"]), upload.single('rc_product_img'), updateCustomerRedeemProduct);


// Delete Product
router.delete('/customer/delete-redeem-product/:id', authorize(["admin"]), deleteCustomerRedeemProduct);


// Redeem Product by farmer
router.post('/post/customer/redeem-product', authorize(["customer"]), redeemProductCustomer);


// Redeem Product by customers history
router.get('/get/customer/redeem-product-history', authorize(["admin"]), getRedeemProductHistoryCustomer);

// Get redemption history for a specific customer by customerId
router.get('/customer/redeem-history/:customerId', authorize(["customer"]), getRedeemProductsByCustomerId);

module.exports = router;

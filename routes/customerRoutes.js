const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/CustomerController')
const { authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const { getProductsByCity } = require('../controllers/productController');



// Get all items in the cart (protected)
router.post('/auth/customer_login', CustomerController.loginCustomer);


// Add a product to the cart (protected)
router.post('/auth/customer_register', CustomerController.registerCustomer);


// Get Customer by ID
router.get("/customer/:id", authorize(['customer']),  CustomerController.getCustomerById);


// Update Customer
router.put("/update-customer/:id", upload.single('profile_image'), authorize(['customer']), CustomerController.updateCustomer);


router.post('/customer/send-otp', CustomerController.sendOtptoCustomer);


router.post('/customer/verify-otp', CustomerController.verifyCustomerOtp);

router.get('/search', CustomerController.searchByNameAndCity);


// GET /api/search/products?city=city_district
router.get('/search/products', getProductsByCity);

module.exports = router;

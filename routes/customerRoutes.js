const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/CustomerController')
const { authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const { getProductsByCity } = require('../controllers/productController');
const { createRazorpayOrderForCustomerPoints } = require('../controllers/razorpayController');


// Get all items in the cart (protected)
router.post('/auth/customer_login', CustomerController.loginCustomer);


// Add a product to the cart (protected)
router.post('/auth/customer_register', CustomerController.registerCustomer);


// Get Customer by ID
router.get("/customer/:id", authorize(['customer', 'admin']),  CustomerController.getCustomerById);


// Update Customer
router.put("/update-customer/:id", upload.single('profile_image'), authorize(['customer']), CustomerController.updateCustomer);


router.post('/customer/send-otp', CustomerController.sendOtptoCustomer);


router.post('/customer/verify-otp', CustomerController.verifyCustomerOtp);


router.get('/search', CustomerController.searchByNameAndCity);


// GET /api/search/products?city=city_district
router.get('/search/products', getProductsByCity);


// Daily Reward
router.post('/customer/reward-daily', authorize(["customer"]), CustomerController.rewardDailyPointsCustomer);


// POST /api/customer/referral-share
router.post('/customer/referral-share', authorize(["customer"]), CustomerController.incrementReferralShareCustomer);


// get /api/customer/referral-details
router.get('/customer/referral-details/:id', authorize(["admin"]), CustomerController.getCustomerReferralDetails);


// get /api/customer/points transaction history
router.get('/customer/points-transaction/:customerId', authorize(["admin", "customer"]), CustomerController.getCustomerPointsTransactions);


router.get('/all-customers', authorize(["admin"]), CustomerController.getAllCustomers );


router.delete('/delete/customer/:id', CustomerController.deleteCustomer);


router.post('/customer/upgrade-points/:customerId', authorize(["customer"]), CustomerController.upgradeCustomerPoints);


// Route for creating Razorpay order for customer upgrade points
router.post('/customer/createRazorpayOrder', authorize(["customer"]), createRazorpayOrderForCustomerPoints);


module.exports = router;

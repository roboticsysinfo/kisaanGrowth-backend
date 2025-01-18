const express = require('express');
const { getCart, addToCart, updateCartItem, removeFromCart } = require('../controllers/cartController');
const { authorize } = require('../middlewares/authMiddleware'); // Protect routes
const router = express.Router();

// Get all items in the cart (protected)
router.get('/cart-items', authorize, getCart);

// Add a product to the cart (protected)
router.post('/add-to-cart', authorize, addToCart);

// Update quantity of a product in the cart (protected)
router.put('/update_item/:itemId', authorize, updateCartItem);

// Remove a product from the cart (protected)
router.delete('/remove_item/:itemId', authorize, removeFromCart);

module.exports = router;

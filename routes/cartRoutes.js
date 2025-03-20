const express = require('express');
const { getCart, addToCart, updateCartItem, removeFromCart } = require('../controllers/cartController');
const { authorize } = require('../middlewares/authMiddleware'); // Protect routes
const router = express.Router();

// Get all items in the cart (protected)
router.get('/cart-items', authorize(['customer']), getCart);

// Add a product to the cart (protected)
router.post('/add-to-cart', authorize(['customer']), addToCart);

// Update quantity of a product in the cart (protected)
router.put('/update-item/:itemId', authorize(['customer']), updateCartItem);

// Remove a product from the cart (protected)
router.delete('/remove-item/:itemId', authorize(['customer']), removeFromCart);

module.exports = router;

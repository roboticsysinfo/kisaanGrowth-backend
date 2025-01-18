const Cart = require('../models/Cart');
const Product = require('../models/Product'); // Assuming Product model exists

// Get all items in the customer's cart
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.json(cart.items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a product to the cart
const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find the cart for the logged-in user
    let cart = await Cart.findOne({ user: req.user.id });

    // If cart doesn't exist, create a new one
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Check if the product already exists in the cart
    const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (existingItemIndex >= 0) {
      // If the product already exists in the cart, update the quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // If the product doesn't exist in the cart, add it
      cart.items.push({ product: productId, quantity });
    }

    // Save the cart
    await cart.save();

    res.status(201).json({ message: 'Product added to cart', cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update the quantity of a product in the cart
const updateCartItem = async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  try {
    // Find the cart for the logged-in user
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find the cart item to update
    const cartItem = cart.items.id(itemId);

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Update the quantity of the product
    cartItem.quantity = quantity;
    await cart.save();

    res.json({ message: 'Cart item updated', cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove a product from the cart
const removeFromCart = async (req, res) => {
  const { itemId } = req.params;

  try {
    // Find the cart for the logged-in user
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find the cart item to remove
    const cartItem = cart.items.id(itemId);

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Remove the cart item
    cartItem.remove();
    await cart.save();

    res.json({ message: 'Product removed from cart', cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
};

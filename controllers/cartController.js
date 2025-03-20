const Cart = require('../models/CartModel');
const Product = require('../models/Product'); // Assuming Product model exists

// Get all items in the customer's cart
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: 'items.product',
        select: 'name price_per_unit product_image'
      });
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
    // Check Product Exist
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find Logged in customer
    let userCart = await Cart.findOne({ user: req.user.id });

    console.log("User Cart", userCart);

    // If Cart not fine , make new one
    if (!userCart) {
      userCart = new Cart({ user: req.user.id, items: [] });
    }

    // Check product already in cart or not
    const existingItemIndex = userCart.items.findIndex(item => item.product.toString() === productId);

    if (existingItemIndex >= 0) {
      // If Cart already exist increase qunatity
      userCart.items[existingItemIndex].quantity += quantity;
    } else {
      // If not exist add in cart
      userCart.items.push({ product: productId, quantity });
    }

    // Save in cart table
    await userCart.save();

    res.status(201).json({ message: 'Product added to cart', cart: userCart });
  } catch (error) {
    console.error("Error in addToCart:", error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Update the quantity of a product in the cart
const updateCartItem = async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  // Quantity should be at least 1
  if (quantity < 1) {
    return res.status(400).json({ message: 'Quantity must be at least 1' });
  }

  try {
    // Find and update the cart item directly using MongoDB update
    const cart = await Cart.findOneAndUpdate(
      { user: req.user.id, "items._id": itemId },
      { $set: { "items.$.quantity": quantity } },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ message: 'Cart or item not found' });
    }

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

    // Check if item exists
    const cartItem = cart.items.id(itemId);


    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // ✅ Use filter instead of remove()
    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

    await cart.save(); // ✅ Save after updating array

    res.json({ message: 'Product removed from cart', cart });
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({ message: 'Server error' });
  }
};





module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
};

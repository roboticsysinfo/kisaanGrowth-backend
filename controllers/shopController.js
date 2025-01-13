const Shop = require('../models/Shop');

// Create a new shop
const createShop = async (req, res) => {
  try {
    const { user_id, shop_name, shop_description, shop_location, pricing_preference, preferred_buyers } = req.body;

    const shop = new Shop({
      user_id,
      shop_name,
      shop_description,
      shop_image: req.file ? req.file.path : undefined, // Save the uploaded file path
      shop_location,
      pricing_preference,
      preferred_buyers,
    });

    const savedShop = await shop.save();
    res.status(201).json(savedShop);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all shops
const getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find().populate('user_id', 'name email');
    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single shop by ID
const getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('user_id', 'name email');
    if (!shop) return res.status(404).json({ error: 'Shop not found' });
    res.status(200).json(shop);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a shop
const updateShop = async (req, res) => {
  try {
    const updatedData = req.body;

    if (req.file) {
      updatedData.shop_image = req.file.path; // Update the shop_image if a new file is uploaded
    }

    const shop = await Shop.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    res.status(200).json(shop);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a shop
const deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.id);
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    res.status(200).json({ message: 'Shop deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createShop,
  getAllShops,
  getShopById,
  updateShop,
  deleteShop,
};

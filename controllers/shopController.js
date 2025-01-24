const Shop = require('../models/Shop'); // Adjust the path as needed
const Product = require('../models/Product')
const multer = require('multer');
const path = require('path');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Set upload directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});
const upload = multer({ storage });

// Create a new shop
const createShop = async (req, res) => {
  try {
    const farmerId = req.user._id; // Assuming farmer_id is fetched from the authenticated user
    const {
      shop_name,
      phoneNumber,
      whatsappNumber,
      city_district,
      state,
      shop_address,
      shop_description,
      pricing_preference,
      preferred_buyers,
      village_name
    } = req.body;

    const shop = new Shop({
      farmer_id: farmerId,
      shop_name,
      phoneNumber,
      whatsappNumber,
      city_district,
      state,
      shop_address,
      shop_description,
      pricing_preference,
      preferred_buyers,
      village_name,
      shop_image: req.files.shop_image ? req.files.shop_image.map(file => file.path) : [],
      shop_cover_image: req.files.shop_cover_image ? req.files.shop_cover_image[0].path : null,
      shop_profile_image: req.files.shop_profile_image ? req.files.shop_profile_image[0].path : null,
    });

    const savedShop = await shop.save();
    res.status(201).json(savedShop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all shops for a farmer
const getFarmerShops = async (req, res) => {
  try {
    const farmerId = req.user._id;
    const shops = await Shop.find({ farmer_id: farmerId });
    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a shop
const updateShop = async (req, res) => {
  try {
    const shopId = req.params.id;
    const updates = req.body;

    if (req.files.shop_image) {
      updates.shop_image = req.files.shop_image.map(file => file.path);
    }
    if (req.files.shop_cover_image) {
      updates.shop_cover_image = req.files.shop_cover_image[0].path;
    }
    if (req.files.shop_profile_image) {
      updates.shop_profile_image = req.files.shop_profile_image[0].path;
    }

    const updatedShop = await Shop.findByIdAndUpdate(shopId, updates, { new: true });
    res.status(200).json(updatedShop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a shop
const deleteShop = async (req, res) => {
  try {
    const shopId = req.params.id;
    await Shop.findByIdAndDelete(shopId);
    res.status(200).json({ message: 'Shop deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get shops by location (city or state)
const getShopsByLocation = async (req, res) => {
  try {
    const { city_district, state } = req.query; // Query parameters for location
    const query = {};

    if (city_district) query.city_district = city_district;
    if (state) query.state = state;

    const shops = await Shop.find(query);
    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get shops by category (preferred_buyers or pricing_preference)
const getShopsByCategory = async (req, res) => {
  try {
    const { preferred_buyers, pricing_preference } = req.query; // Query parameters for category
    const query = {};

    if (preferred_buyers) query.preferred_buyers = preferred_buyers;
    if (pricing_preference) query.pricing_preference = pricing_preference;

    const shops = await Shop.find(query);
    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Search shops by keyword, location, and category
const searchShops = async (req, res) => {
  try {
    const { keyword, city_district, state, category } = req.query;

    // Build the search query
    const shopQuery = {};

    // Add location filters (optional)
    if (city_district) shopQuery.city_district = { $regex: city_district, $options: 'i' }; // Case-insensitive search
    if (state) shopQuery.state = { $regex: state, $options: 'i' }; // Case-insensitive search

    // If a keyword is provided, search by shop name or description
    if (keyword) {
      shopQuery.$or = [
        { shop_name: { $regex: keyword, $options: 'i' } }, // Case-insensitive search for shop name
        { shop_description: { $regex: keyword, $options: 'i' } }, // Case-insensitive search for description
      ];
    }

    // If a category is provided, find related shop IDs through the Product model
    if (category) {
      const products = await Product.find({ category: { $regex: category, $options: 'i' } }); // Find products by category
      const shopIds = [...new Set(products.map(product => product.shop_id))]; // Extract unique shop IDs
      shopQuery._id = { $in: shopIds }; // Filter shops by these IDs
    }

    // Fetch shops matching the search criteria
    const shops = await Shop.find(shopQuery);
    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports={
  upload,
  createShop,
  updateShop,
  deleteShop,
  getFarmerShops,
  getShopsByLocation,
  getShopsByCategory,
  searchShops
}
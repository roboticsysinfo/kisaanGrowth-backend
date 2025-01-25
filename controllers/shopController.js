const Shop = require('../models/Shop'); // Adjust the path as needed
const Product = require('../models/Product')
const multer = require('multer');
const path = require('path');
const { default: mongoose } = require('mongoose');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file with timestamp
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Images only!'));
    }
  },
});


// Create Shop 
const createShop = async (req, res) => {
  try {
    const farmerId = req.user._id; // Assuming farmer_id is fetched from the authenticated user
    
    console.log(farmerId)

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
      village_name,
    } = req.body;

    // // Validate required fields
    // if (!shop_name || !phoneNumber || !whatsappNumber || !city_district || !state || !shop_address) {
    //   return res.status(400).json({ message: "Missing required fields" });
    // }

    // Process file uploads
    const shop_image = req.files?.shop_image ? req.files.shop_image.map(file => file.path) : [];
    const shop_cover_image = req.files?.shop_cover_image?.[0]?.path || null;
    const shop_profile_image = req.files?.shop_profile_image?.[0]?.path || null;

    // Create a new shop
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
      shop_image,
      shop_cover_image,
      shop_profile_image,
    });

    const savedShop = await shop.save();
    res.status(201).json({ success: true, data: savedShop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get all shops for a farmer
const getAllShops = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10
    const shops = await Shop.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalShops = await Shop.countDocuments(); // Count the total number of shops

    res.status(200).json({
      success: true,
      data: shops,
      pagination: {
        totalShops,
        currentPage: page,
        totalPages: Math.ceil(totalShops / limit),
      },
    });
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
  getAllShops,
  getShopsByLocation,
  getShopsByCategory,
  searchShops
}
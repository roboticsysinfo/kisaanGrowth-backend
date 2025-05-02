const Shop = require('../models/Shop'); // Adjust the path as needed
const Product = require('../models/Product')
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');


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

    // Check if the farmer already has a shop
    const existingShop = await Shop.findOne({ farmer_id: farmerId });

    if (existingShop) {
      // If a shop already exists for the farmer, send an error message
      return res.status(400).json({ message: "You can only create one shop. Please update your existing shop details." });
    }

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

    // Validate required fields
    if (!shop_name || !phoneNumber || !whatsappNumber || !city_district || !state || !shop_address) {
      return res.status(400).json({ message: "Missing required fields" });
    }

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


// Get Shop by Farmer ID
const getShopByFarmerId = async (req, res) => {
  try {
    const farmerId = req.user._id;
    // Assuming farmer_id is fetched from the authenticated user

    // Find the shop by the farmer's ID
    const shop = await Shop.findOne({ farmer_id: farmerId });

    if (!shop) {
      // If no shop is found for the farmer, return an error message
      return res.status(404).json({ message: "No shop found for this farmer." });
    }

    // Return the found shop
    res.status(200).json({ success: true, data: shop });
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

// Get shops by location city 
const getShopsByLocation = async (req, res) => {
  try {
    const { city_district } = req.query;

    if (!city_district) {
      return res.status(400).json({ message: "City/District is required" });
    }

    // Case-insensitive search using regex
    const shops = await Shop.find({
      city_district: { $regex: new RegExp(`^${city_district}$`, "i") },
    });

    if (shops.length === 0) {
      return res.status(200).json({ shops: [], message: "No shops found in this district" });
    }

    res.status(200).json({ shops });
  } catch (error) {
    console.error("❌ Error fetching shops:", error);
    res.status(500).json({ message: "Internal server error" });
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


// Get Shop by Shop ID
const getShopById = async (req, res) => {
  
  try {

    const { id } = req.params;

    // ✅ Check if 'id' is coming or not
    if (!id) {
      console.error("🚨 Shop ID is missing in req.params!");
      return res.status(400).json({ success: false, message: "Shop ID is required" });
    }

    const shop = await Shop.findById(id).populate("farmer_id").lean();

    if (!shop) {
      console.error("🚨 Shop not found for ID:", id);
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    res.status(200).json({ success: true, shop });
  } catch (error) {
    console.error("❌ Error fetching shop:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }

};


// const getProductsByShopId = async (req, res) => {
//   try {
//     const { shopId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(shopId)) {
//       return res.status(400).json({ message: "Invalid Shop ID" });
//     }

//     const products = await Product.find({ shop_id: shopId })
//       .populate("shop_id", "shop_name") // Shop model se shop_name fetch karega
//       .select("name price_per_unit quantity unit harvest_date product_image");
//     // Sirf required fields return karega


//     if (!products.length) {
//       return res.status(404).json({ message: "No products found for this shop" });
//     }

//     res.status(200).json(products);
//   } catch (error) {
//     console.error("Error fetching products by shop ID:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };


// Search shops by city name or shop name


const getProductsByShopId = async (req, res) => {
  try {
    const { shopId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(shopId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Shop ID"
      });
    }

    const products = await Product.find({ shop_id: shopId })
      .populate("shop_id", "shop_name") // Shop model se shop_name fetch karega
      .select("name price_per_unit quantity unit harvest_date product_image");

    // If no products are found, return a message with success = false
    if (!products.length) {
      return res.status(404).json({
        success: false,
        message: "No products found for this shop"
      });
    }

    // Return products with success = true
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products
    });
  } catch (error) {
    console.error("Error fetching products by shop ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


const searchShops = async (req, res) => {
  try {
    const { keyword } = req.query;

    const shopQuery = {};

    // If keyword is provided, search by shop_name or city_district
    if (keyword) {
      shopQuery.$or = [
        { shop_name: { $regex: keyword, $options: 'i' } },
        { city_district: { $regex: keyword, $options: 'i' } },
      ];
    }

    const shops = await Shop.find(shopQuery);

    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = {
  upload,
  createShop,
  updateShop,
  deleteShop,
  getAllShops,
  getShopsByLocation,
  getShopsByCategory,
  getShopByFarmerId,
  searchShops,
  getShopById,
  getProductsByShopId
}
const express = require('express');
const multer = require('multer');
const path = require('path');
const Shop = require('../models/Shop'); // Assuming this is the Shop model file

const router = express.Router();

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Define the uploads directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);
    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb(new Error('Images only!'));
    }
  },
});

// Create a new shop
const createShop = async (req, res) => {
  try {
    const { farmer_id, shop_name, shop_description, shop_location, pricing_preference, preferred_buyers, certification_name } = req.body;

    const shop = new Shop({
      farmer_id,
      shop_name,
      shop_description,
      shop_location,
      pricing_preference,
      preferred_buyers,
      certification_name,
      shop_image: req.files['shop_image'] ? req.files['shop_image'][0].path : undefined,
      certification_image: req.files['certification_image'] ? req.files['certification_image'][0].path : undefined,
    });

    // Check if the farmer already has a shop
    const existingShop = await Shop.findOne({ farmer_id });

    if (existingShop) {
      return res.status(400).json({ message: "You can only have one shop." });
    }

    const savedShop = await shop.save();
    res.status(201).json(savedShop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Get all shops
const getAllShops = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const shops = await Shop.find()
      .select('shop_name shop_image certification_name shop_description')
      .populate('farmer_id')
      .skip(skip)
      .limit(Number(limit))
      .lean();
    const totalCount = await Shop.countDocuments();
    res.status(200).json({
      shops,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error('Error fetching shops:', err); // Log the error
    res.status(500).json({ message: err.message });
  }
};




// Get a shop by ID
const getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.status(200).json(shop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Update a shop by ID
const updateShop = async (req, res) => {
  try {
    const { farmer_id, shop_name, shop_description, shop_location, pricing_preference, preferred_buyers, certification_name } = req.body;

    const updates = {
      farmer_id,
      shop_name,
      shop_description,
      shop_location,
      pricing_preference,
      preferred_buyers,
      certification_name,
    };

    if (req.files['shop_image']) updates.shop_image = req.files['shop_image'][0].path;
    if (req.files['certification_image']) updates.certification_image = req.files['certification_image'][0].path;

    const shop = await Shop.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    res.status(200).json(shop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Delete a shop by ID
const deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.status(200).json({ message: 'Shop deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  createShop,
  updateShop,
  getAllShops,
  getShopById,
  deleteShop,
  upload
}


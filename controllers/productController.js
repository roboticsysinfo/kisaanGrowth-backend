const Product = require('../models/Product');
const Shop = require('../models/Shop');
const PointsTransaction = require('../models/pointsTransactionHistory')
const Farmer = require("../models/Farmer")
const imagekit = require("../utils/imagekit");
const fs = require("fs");

// Create a new product

const createProduct = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).json({ message: 'Farmer ID is required' });
    }

    const farmerId = req.user._id;
    let shop = await Shop.findOne({ farmer_id: farmerId });

    if (!shop) {
      shop = await Shop.create({ farmer_id: farmerId, name: 'Default Shop' });
    }

    const newProductData = {
      ...req.body,
      farmer_id: farmerId,
      shop_id: shop._id,
    };

    // ✅ Image upload to ImageKit (from memory)
    if (req.file) {
      const fileBuffer = req.file.buffer;

      const uploadedImage = await imagekit.upload({
        file: fileBuffer, // buffer, not path
        fileName: req.file.originalname,
        folder: "/uploads",
      });

      newProductData.product_image = uploadedImage.url;
    }

    const newProduct = new Product(newProductData);
    await newProduct.save();

    // ✅ Award points to farmer
    await Farmer.findByIdAndUpdate(farmerId, { $inc: { points: 2 } });

    await PointsTransaction.create({
      farmer: farmerId,
      type: "new_product_added",
      points: 2,
      description: "Points awarded for adding a new product",
      date: new Date(),
    });

    res.status(201).json({
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error in createProduct:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .select('name price_per_unit quantity category_id farmer_id shop_id product_image description season harvest_date')
      .populate('farmer_id', 'name')
      .populate('category_id', 'name')
      .populate('shop_id', 'shop_name')
      .sort({ createdAt: -1 }) // ✅ Sort latest first
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const totalCount = await Product.countDocuments();

    res.status(200).json({
      products,
      total: totalCount, // ✅ frontend expects `total`
      totalPages: Math.ceil(totalCount / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Get a product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('farmer_id')
      .populate('shop_id')
      .populate('category_id')

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const getProductByFarmerId = async (req, res) => {

  try {

    const farmerId = req.user._id;

    const products = await Product.find({ farmer_id: farmerId })
      .populate("category_id", "name"); // Populate only category_name

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found for this farmer." });
    }

    res.status(200).json({ success: true, data: products });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }

};

// Update a product

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      season,
      category_id,
      price_per_unit,
      quantity,
      unit,
      description,
      harvest_date,
    } = req.body;

    const updateData = {
      name,
      season,
      category_id,
      price_per_unit,
      quantity,
      unit,
      description,
      harvest_date,
    };

    // 🖼️ Check if image file is included
    if (req.file) {

      const filePath = req.file.path;

      if (!fs.existsSync(filePath)) {
        return res.status(400).json({ message: "Uploaded file not found" });
      }

      try {
        const fileBuffer = fs.readFileSync(filePath);

        const uploadedImage = await imagekit.upload({
          file: fileBuffer,
          fileName: req.file.originalname,
          folder: "/uploads",
        });

        updateData.product_image = uploadedImage.url;

        // 🧹 Delete temp file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (uploadErr) {
        console.error("Image upload error:", uploadErr.message);
        return res.status(500).json({ message: "Image upload failed", error: uploadErr.message });
      }
    } else if (req.body.product_image) {
      // 📝 If URL is sent in body (optional fallback)
      updateData.product_image = req.body.product_image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });

  } catch (err) {
    console.error("Error updating product:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      message: 'Product deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get products by subcategory ID
const getProductsByCategory = async (req, res) => {

  try {

    const { categoryId } = req.params;

    const products = await Product.find({ category_id: req.params.categoryId })
      .populate('farmer_id')
      .populate('shop_id')
      .populate('category_id');


    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products found for this Category' });
    }

    res.status(200).json({
      message: 'Products retrieved successfully',
      products,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};


// Get products by category ID and city_district
const getProductsByCategoryLocation = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { city } = req.query; // "Karnal" etc.

    // Populate shop and filter by category and location
    const products = await Product.find({ category_id: categoryId })
      .populate('farmer_id')
      .populate('shop_id')
      .populate('category_id');

    // Filter products by shop location
    const filteredProducts = products.filter(p =>
      p.shop_id && p.shop_id.city_district && p.shop_id.city_district.toLowerCase() === city.toLowerCase()
    );

    if (!filteredProducts || filteredProducts.length === 0) {
      return res.status(404).json({ message: 'No products found for this Category and Location' });
    }

    res.status(200).json({
      message: 'Products retrieved successfully',
      products: filteredProducts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const getProductsByCity = async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ message: 'Please provide a city_district in query' });
    }

    // Find all shops in the given city
    const shops = await Shop.find({ city_district: city }).select('_id');
    const shopIds = shops.map(shop => shop._id);

    // Find products belonging to these shops
    const products = await Product.find({ shop_id: { $in: shopIds } })
      .populate('shop_id', 'shop_name city_district')
      .populate('farmer_id', 'name')
      .populate('category_id', 'name');

    res.status(200).json(products);
  } catch (err) {
    console.error('Error in getProductsByCity:', err);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductByFarmerId,
  getProductsByCity,
  getProductsByCategoryLocation
};

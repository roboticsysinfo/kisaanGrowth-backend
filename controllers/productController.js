const Product = require('../models/Product');

// Create a new product
const createProduct = async (req, res) => {
  try {
    const {
      farmer_id,
      farm_id,
      shop_id,
      name,
      season,
      sub_category_id,
      category_id,
      price_per_unit,
      quantity,
      unit,
      description,
      harvest_date,
      product_image
    } = req.body;

    const newProduct = new Product({
      farmer_id,
      farm_id,
      shop_id,
      name,
      season,
      category_id,
      sub_category_id,
      price_per_unit,
      quantity,
      unit,
      description,
      harvest_date,
      product_image : req.file ? `${req.file.filename}` : undefined,
    });


    await newProduct.save();
    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// // Get all products
const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 20
    const skip = (page - 1) * limit;

    // Get products with selected fields and pagination
    const products = await Product.find()
      .select('name price_per_unit quantity category_id sub_category_id farmer_id shop_id product_image') // Select only necessary fields
      .populate('farmer_id', 'name')  // Populate only the necessary fields for farmer
      .populate('farm_id', 'name farm_location')    // Populate only necessary fields for farm
      .populate('category_id', 'name')   // Populate only necessary fields for category
      .populate('sub_category_id', 'name') // Populate only necessary fields for sub-category
      .skip(skip) // Implement pagination (skip records)
      .limit(Number(limit)) // Limit the number of records returned
      .lean(); // Makes the query faster by returning plain JavaScript objects

    // Count total number of products to calculate total pages
    const totalCount = await Product.countDocuments();

    res.status(200).json({
      products,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
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
      .populate('farm_id')
      .populate('shop_id')
      .populate('category_id')
      .populate('sub_category_id');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
      product_image,
    } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, season, category_id, price_per_unit, quantity, unit, description, harvest_date, product_image },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
const getProductsBySubCategory = async (req, res) => {
  try {
    const { sub_category_id } = req.params;

    const products = await Product.find({ sub_category_id })
      .populate('farmer_id')
      .populate('farm_id')
      .populate('shop_id')
      .populate('category_id')
      .populate('sub_category_id');

    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products found for this subcategory' });
    }

    res.status(200).json({
      message: 'Products retrieved successfully',
      products,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsBySubCategory, 
};

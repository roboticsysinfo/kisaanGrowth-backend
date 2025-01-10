const Product = require('../models/Product');

// Create a new product
const createProduct = async (req, res) => {
  try {
    const { farmer_id, farm_id, shop_id, name, season, category_id, price_per_unit, quantity, unit, description, harvest_date, product_image } = req.body;

    const newProduct = new Product({
      farmer_id,
      farm_id,
      shop_id,
      name,
      season,
      category_id,
      price_per_unit,
      quantity,
      unit,
      description,
      harvest_date,
      product_image
    });

    await newProduct.save();
    res.status(201).json({
      message: 'product created successfully',
      product: newProduct,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get all product
const getAllProduct = async (req, res) => {
  try {
    const product = await Product.find().populate('farmer_id farm_id shop_id category_id');
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get a product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await product.findById(id).populate('farmer_id farm_id shop_id category_id');

    if (!product) {
      return res.status(404).json({ message: 'product not found' });
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
    const { name, season, category_id, price_per_unit, quantity, unit, description, harvest_date, product_image } = req.body;

    const updatedproduct = await Product.findByIdAndUpdate(
      id,
      { name, season, category_id, price_per_unit, quantity, unit, description, harvest_date, product_image },
      { new: true }
    );

    if (!updatedproduct) {
      return res.status(404).json({ message: 'product not found' });
    }

    res.status(200).json({
      message: 'product updated successfully',
      product: updatedproduct,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedproduct = await Product.findByIdAndDelete(id);

    if (!deletedproduct) {
      return res.status(404).json({ message: 'product not found' });
    }

    res.status(200).json({
      message: 'product deleted successfully',
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
  deleteProduct
};

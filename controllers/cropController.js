const Crop = require('../models/Crop');

// Create a new crop
const createCrop = async (req, res) => {
  try {
    const { farmer_id, farm_id, shop_id, name, season, category_id, price_per_unit, quantity, unit, description, harvest_date, crop_image } = req.body;

    const newCrop = new Crop({
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
      crop_image
    });

    await newCrop.save();
    res.status(201).json({
      message: 'Crop created successfully',
      crop: newCrop,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get all crops
const getAllCrops = async (req, res) => {
  try {
    const crops = await Crop.find().populate('farmer_id farm_id shop_id category_id');
    res.status(200).json(crops);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get a crop by ID
const getCropById = async (req, res) => {
  try {
    const { id } = req.params;
    const crop = await Crop.findById(id).populate('farmer_id farm_id shop_id category_id');

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    res.status(200).json(crop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Update a crop
const updateCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, season, category_id, price_per_unit, quantity, unit, description, harvest_date, crop_image } = req.body;

    const updatedCrop = await Crop.findByIdAndUpdate(
      id,
      { name, season, category_id, price_per_unit, quantity, unit, description, harvest_date, crop_image },
      { new: true }
    );

    if (!updatedCrop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    res.status(200).json({
      message: 'Crop updated successfully',
      crop: updatedCrop,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a crop
const deleteCrop = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCrop = await Crop.findByIdAndDelete(id);

    if (!deletedCrop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    res.status(200).json({
      message: 'Crop deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createCrop,
  getAllCrops,
  getCropById,
  updateCrop,
  deleteCrop
};

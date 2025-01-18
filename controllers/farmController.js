const Farm = require('../models/Farm')


// Create Farm
const createFarm = async (req, res) => {
    try {
      const { farmer_id, name, land_size, farming_type, farm_address, farm_photos, description, village, district} = req.body;
  
      const newFarm = new Farm({
        farmer_id,
        name,
        description,
        land_size,
        farming_type,
        certification_name,
        certification_image,
        farm_photos,
        farm_address,
        village,
        district
      });
  
      await newFarm.save();
      res.status(201).json({
        message: 'Farm created successfully',
        farm: newFarm,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };


// Get all farms
const getAllFarms = async (req, res) => {
    try {
      const farms = await Farm.find().populate( 'farmer_id' ,'name'); // Populate farmer name
      res.status(200).json(farms); // Return all farms
      console.log(farms)
    } catch (err) {
      res.status(500).json({ message: err.message }); // Handle errors
    }
};


  // Get a farm by ID
const getFarmById = async (req, res) => {
    try {
      const { id } = req.params; // Get the farm ID from URL params
      const farm = await Farm.findById(id).populate('farmer_id', 'name'); // Populate farmer name
  
      if (!farm) {
        return res.status(404).json({ message: 'Farm not found' }); // If farm not found
      }
  
      res.status(200).json(farm); // Return the farm
    } catch (err) {
      res.status(500).json({ message: err.message }); // Handle errors
    }
  };

  
  // Update a farm by ID
const updateFarm = async (req, res) => {
    try {
      const { id } = req.params; // Get farm ID from URL params
      const updatedFarm = await Farm.findByIdAndUpdate(id, req.body, {
        new: true, // Return the updated document
        runValidators: true, // Run schema validations
      });
  
      if (!updatedFarm) {
        return res.status(404).json({ message: 'Farm not found' }); // If farm not found
      }
  
      res.status(200).json(updatedFarm); // Return the updated farm
    } catch (err) {
      res.status(400).json({ message: err.message }); // Handle errors
    }
  };

  
  // Delete a farm by ID
const deletedFarm = async (req, res) => {
    try {
      const { id } = req.params; // Get farm ID from URL params
      const deletedFarm = await Farm.findByIdAndDelete(id);
  
      if (!deletedFarm) {
        return res.status(404).json({ message: 'Farm not found' }); // If farm not found
      }
  
      res.status(200).json({ message: 'Farm deleted successfully' }); // Return success message
    } catch (err) {
      res.status(500).json({ message: err.message }); // Handle errors
    }
  };

  
module.exports={
    createFarm,
    getAllFarms,
    getFarmById,
    updateFarm,
    deletedFarm
}
  
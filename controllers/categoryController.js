const Category = require("../models/Category");


// Create a category
const createCategory = async (req, res) => {
  try {

    const {
      name,
    } = req.body;

    const category = new Category({
      name,
      category_image : req.file ? req.file.filename : undefined,
    });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}


const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("productCount"); // Virtual ko populate karna hoga

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// Update a category
const updateCategory = async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
    };

    // Check if a file was uploaded and include it in the updates
    if (req.file) {
      updates.category_image = req.file.filename;
    }

    // Perform the update
    const category = await Category.findByIdAndUpdate(req.params.id, updates, {
      new: true, // Return the updated document
      runValidators: true, // Validate the updates
    });

    // If category not found, return 404
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Respond with the updated category
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// Delete a category
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory
}

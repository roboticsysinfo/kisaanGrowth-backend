const SubCategory = require("../models/SubCategory");
const Category = require("../models/Category");


// Create a subcategory and link it to a category
const createSubCategory =  async (req, res) => {
  try {
    const { name, categoryId } = req.body;

    // Ensure the category exists
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const subCategory = new SubCategory({ name, category: categoryId });
    await subCategory.save();
    res.status(201).json(subCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Get all subcategories
const getAllSubCategories = async (req, res) => { 
  try {
    const subCategories = await SubCategory.find().populate("category", "name");
    res.status(200).json(subCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Update a subcategory
const updateSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("category", "name");

    if (!subCategory) return res.status(404).json({ message: "Subcategory not found" });
    res.status(200).json(subCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Delete a subcategory
const deleteSubCategory =  async (req, res) => {
  try {
    const subCategory = await SubCategory.findByIdAndDelete(req.params.id);
    if (!subCategory) return res.status(404).json({ message: "Subcategory not found" });
    res.status(200).json({ message: "Subcategory deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
    createSubCategory,
    getAllSubCategories,
    updateSubCategory,
    deleteSubCategory
}

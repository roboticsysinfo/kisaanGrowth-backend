const Category = require("../models/Category");
const ImageKit = require("../utils/imagekit")


// Helper: upload to ImageKit
const uploadToImageKit = (file) => {
  return new Promise((resolve, reject) => {
    ImageKit.upload({
      file: file.buffer,
      fileName: file.originalname,
      folder: "/uploads"
    }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};

// Create Category
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    let imageUrl;

    if (req.file) {
      const uploadedImage = await uploadToImageKit(req.file);
      imageUrl = uploadedImage.url;
    }

    const category = new Category({
      name,
      category_image: imageUrl,
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// Update Category
const updateCategory = async (req, res) => {

  try {
    const updates = { name: req.body.name };

    if (req.file) {
      const uploadedImage = await uploadToImageKit(req.file);
      updates.category_image = uploadedImage.url;
    }

    const category = await Category.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("productCount"); // Virtual ko populate karna hoga

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

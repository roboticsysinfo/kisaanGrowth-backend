const BlogCategory = require("../models/BlogCategory");

// ✅ Create Blog Category
exports.createBlogCategory = async (req, res) => {
    try {
        const { Blog_category_name } = req.body;

        if (!Blog_category_name) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const existingCategory = await BlogCategory.findOne({ Blog_category_name });
        if (existingCategory) {
            return res.status(400).json({ message: "Category already exists" });
        }

        const newCategory = new BlogCategory({ Blog_category_name });
        await newCategory.save();

        res.status(201).json({ message: "Category created successfully", category: newCategory });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Get All Blog Categories
exports.getBlogCategories = async (req, res) => {
    try {
        const categories = await BlogCategory.find().sort({ createdAt: -1 });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Get Single Blog Category by ID
exports.getBlogCategoryById = async (req, res) => {
    try {
        const category = await BlogCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Update Blog Category
exports.updateBlogCategory = async (req, res) => {
    try {
        const { Blog_category_name } = req.body;

        if (!Blog_category_name) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const updatedCategory = await BlogCategory.findByIdAndUpdate(
            req.params.id,
            { Blog_category_name },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ message: "Category updated successfully", category: updatedCategory });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Delete Blog Category
exports.deleteBlogCategory = async (req, res) => {
    try {
        const category = await BlogCategory.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

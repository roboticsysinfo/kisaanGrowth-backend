const express = require("express");
const {
    createBlogCategory,
    getBlogCategories,
    getBlogCategoryById,
    updateBlogCategory,
    deleteBlogCategory
} = require("../controllers/BlogCategoryController");

const router = express.Router();

// ✅ Create a new category
router.post("/add-blog-category", createBlogCategory);

// ✅ Get all categories
router.get("/blog-categories", getBlogCategories);

// ✅ Get category by ID
router.get("/blog-category/:id", getBlogCategoryById);

// ✅ Update category by ID
router.put("/blog-category-update/:id", updateBlogCategory);

// ✅ Delete category by ID
router.delete("/blog-category-delete/:id", deleteBlogCategory);

module.exports = router;

const express = require("express");
const {
    createBlog,
    getBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    blogViewCount,
    searchBlogs
} = require("../controllers/blogController");

const upload = require("../middlewares/upload"); // Middleware for image upload
const { authorize } = require("../middlewares/authMiddleware"); // Authorization middleware

const router = express.Router();

// ✅ Create a new blog (Admin only)
router.post("/add_blog", upload.single("blog_image"), authorize(["admin"]), createBlog);

// ✅ Update a blog (Admin only)
router.put("/update-blog/:id", upload.single("blog_image"), authorize(["admin"]), updateBlog);



// ✅ Get all blogs
router.get("/blogs", getBlogs);


// ✅ Get a single blog by ID
router.get("/blog/:id", getBlogById);


// ✅ Delete a blog (Admin only)
router.delete("/delete-blog/:id", authorize(["admin"]), deleteBlog);


router.put("/blog/view/:id", blogViewCount);


router.get("/blogs/search", searchBlogs);


module.exports = router;

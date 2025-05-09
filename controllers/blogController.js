const { default: mongoose } = require("mongoose");
const Blog = require("../models/Blog");
const uploadToImageKit = require("../utils/uploadToImageKit");


// ----------- Create BLog -----------

exports.createBlog = async (req, res) => {
    try {
        const {
            blog_title,
            blog_content,
            blog_category,
            imageAltText,
            metaTitle,
            metaDescription,
            metaKeywords
        } = req.body;

        if (!blog_title || !blog_content || !blog_category) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        if (!mongoose.Types.ObjectId.isValid(blog_category)) {
            return res.status(400).json({ message: "Invalid category ID" });
        }

        let blogImageUrl = "";
        if (req.file) {
            const result = await uploadToImageKit(req.file.buffer, req.file.originalname);
            blogImageUrl = result.url;
        }

        const newBlog = new Blog({
            blog_title,
            blog_content,
            author: req.user.userId,
            blog_category: new mongoose.Types.ObjectId(blog_category),
            blog_image: blogImageUrl,
            imageAltText,
            metaTitle,
            metaDescription,
            metaKeywords
        });

        await newBlog.save();
        res.status(201).json({ message: "Blog created successfully", blog: newBlog });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ✅ Get All Blogs with Pagination
exports.getBlogs = async (req, res) => {
    try {
        let { page, limit } = req.query;

        page = parseInt(page) || 1;   // Default page 1
        limit = parseInt(limit) || 10; // Default limit 10 blogs per page

        const skip = (page - 1) * limit;

        const blogs = await Blog.find()
            .populate("author", "name")
            .populate("blog_category", "Blog_category_name")
            .sort({ createdAt: -1 })
            .skip(skip)   // Skip previous pages' blogs
            .limit(limit); // Get only required number of blogs

        const totalBlogs = await Blog.countDocuments(); // Total blogs count
        const totalPages = Math.ceil(totalBlogs / limit); // Calculate total pages

        res.status(200).json({
            totalBlogs,
            totalPages,
            currentPage: page,
            blogs,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ✅ Get Single Blog by ID
exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate("author", "name").populate("blog_category", "Blog_category_name");
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Update Blog

exports.updateBlog = async (req, res) => {
    try {
        const {
            blog_title,
            blog_content,
            blog_category,
            imageAltText,
            metaTitle,
            metaDescription,
            metaKeywords
        } = req.body;

        let updateData = {
            blog_title,
            blog_content,
            blog_category,
            imageAltText,
            metaTitle,
            metaDescription,
            metaKeywords
        };

        if (req.file) {
            const result = await uploadToImageKit(req.file.buffer, req.file.originalname);
            updateData.blog_image = result.url;
        }

        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedBlog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        res.status(200).json({ message: "Blog updated successfully", blog: updatedBlog });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};





// ✅ Delete Blog
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Blog view count increase API
exports.blogViewCount = async (req, res) => {
    try {
        const { id } = req.params;

        // Blog ka view count increase kare
        const blog = await Blog.findByIdAndUpdate(
            id,
            { $inc: { blog_views: 1 } },  // Views count increase
            { new: true }
        );

        if (!blog) return res.status(404).json({ message: "Blog not found" });

        res.json({ success: true, blog_views: blog.blog_views });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}


exports.searchBlogs = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ message: "Search query is required" });

        const blogs = await Blog.find({
            title: { $regex: query, $options: "i" }  // Case-insensitive search
        });

        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};
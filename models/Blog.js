const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
    {
        blog_title: {
            type: String,
            required: true,
            trim: true
        },
        blog_content: {
            type: String,
            required: true
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Assuming you have a User model
        },
        blog_category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BlogCategory",
            required: true
        },
        blog_image: {
            type: String, // Store image URL or filename
            default: ""
        },
        imageAltText: {
            type: String, // Alternative text for accessibility and SEO
            default: ""
        },
        metaTitle: {
            type: String,
            trim: true,
            default: ""
        },
        metaDescription: {
            type: String,
            trim: true,
            default: ""
        },
        metaKeywords: {
            type: [String], // Array of keywords for SEO
            default: []
        },
        blog_views: {
            type: Number,
            default: 0
        },

    },
    { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);

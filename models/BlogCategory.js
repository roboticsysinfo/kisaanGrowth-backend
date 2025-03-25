const mongoose = require("mongoose");

const blogCategorySchema = new mongoose.Schema(
    {
        Blog_category_name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        }
    },
    { timestamps: true } // Adds createdAt and updatedAt
);

module.exports = mongoose.model("BlogCategory", blogCategorySchema);

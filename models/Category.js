const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, // Ensure category names are unique
      maxlength: 100, // Optional, character limit for category name
    },
    category_image: {
      type: String,
    },
  },
  {
    timestamps: true, // Automatically includes `createdAt` and `updatedAt`
    toJSON: { virtuals: true }, // Virtuals ko JSON response me include karega
    toObject: { virtuals: true },
  }
);

// **🔥 Virtual field for product count**
categorySchema.virtual("productCount", {
  ref: "Product", // Product Model ka reference
  localField: "_id", // Category ka ID
  foreignField: "category_id", // Product model me category ka reference field
  count: true, // Sirf count karega, full product data nahi laayega
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;

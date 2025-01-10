const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
        unique: true, // Ensure category names are unique
        maxlength: 100, // Optional, character limit for category name
      },
    },
    {
      timestamps: true, // Automatically includes `createdAt` and `updatedAt`
    }
  );
  
  const SubCategory = mongoose.model('SubCategory', subCategorySchema);
  
  module.exports = SubCategory;
  
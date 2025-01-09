const { default: mongoose } = require("mongoose");

const categorySchema = new mongoose.Schema(
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
  
  const Category = mongoose.model('Category', categorySchema);
  
  module.exports = Category;
  
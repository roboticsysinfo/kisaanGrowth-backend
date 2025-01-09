const mongoose = require('mongoose');

const deliveryPreferenceSchema = new mongoose.Schema(
  {
    farmer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the farmer in the Users collection
      required: true,
    },
    delivery_method: {
      type: String,
      enum: ['self-pickup', 'delivery-by-farmer'], // Restricts values to these options
      required: true,
    },
    delivery_range: {
      type: String,
      maxlength: 50, // Optional: limit the length of the delivery range description
    },
    additional_notes: {
      type: String,
      maxlength: 1000, // Optional: limit for extra delivery details
    },
  },
  {
    timestamps: true, // Automatically includes `createdAt` and `updatedAt`
  }
);

const DeliveryPreference = mongoose.model('DeliveryPreference', deliveryPreferenceSchema);

module.exports = DeliveryPreference;

const mongoose = require("mongoose");
const { encrypt, decrypt } = require("../utils/encryption");

const chatMessageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    senderType: { type: String, enum: ["customer", "farmer"], required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, required: true },
    receiverType: { type: String, enum: ["customer", "farmer"], required: true },
    message: { type: String, required: true }, // This will be encrypted
    timestamp: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Encrypt before saving
chatMessageSchema.pre("save", function (next) {
  if (this.isModified("message")) {
    this.message = encrypt(this.message);
  }
  next();
});

// Decrypt message on retrieval
chatMessageSchema.methods.getDecryptedMessage = function () {
  return decrypt(this.message);
};

module.exports = mongoose.model("ChatMessage", chatMessageSchema);

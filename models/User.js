const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: Number, required: true },
  address: { type: String, required: true },
  role: {
    type: String,
    enum: ['farmer', 'customer', 'admin', 'sub_admin'],
    required: true,
    default: 'customer',
  },
  verified: {
    type: Boolean,
    default: false, // By default, farmers are not verified
  },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

// Password Hashing before saving the user
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;

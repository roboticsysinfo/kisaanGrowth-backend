const Customer = require('../models/Customer');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const generateToken = require('../utils/jwtGenerator');

// Register Customer
const registerCustomer = async (req, res) => {

  const { name, email, password, phoneNumber, address } = req.body;

  try {
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Customer already exists' });
    }

    const customer = new Customer({ name, email, password, phoneNumber, address });
    await customer.save();

    res.status(201).json({ message: 'Customer registered successfully', customer });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Login Customer
const loginCustomer = async (req, res) => {
  const { email, password } = req.body;

  try {
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateToken(customer._id, "customer");

    res.status(200).json({
      message: "Login successful",
      token,
      userRole: "customer", // **Ensure role is sent**
      user: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get Customer Details by ID
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select("-password");
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update Customer Details
const updateCustomer = async (req, res) => {
  try {
    const { name, email, phoneNumber, address, profile_image } = req.body;

    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, email, phoneNumber, address, profile_image },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({ message: "Customer updated successfully", customer: updatedCustomer });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// Send OTP (mocked as 1234)
const sendOtptoCustomer = async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ success: false, message: 'Phone number is required' });
  }

  // ✅ Just check if user exists, don't register
  const existingUser = await Customer.findOne({ phoneNumber });
  if (!existingUser) {
    return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
  }

  // ✅ Send static OTP (1234)
  res.json({
    success: true,
    message: 'OTP sent successfully (use 1234 for testing)',
    otp: '1234' // You can remove this in production
  });
};


// Verify OTP
const verifyCustomerOtp = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({ success: false, message: 'Phone number and OTP are required' });
  }

  if (otp !== '1234') {
    return res.status(401).json({ success: false, message: 'Invalid OTP' });
  }

  try {
    const user = await Customer.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
    }

    const token = generateToken(user._id, 'customer');

    res.json({
      success: true,
      message: 'OTP verified successfully. Logged in!',
      token,
      user
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Search Api - fined shop, farmers, products based on city

const searchByNameAndCity = async (req, res) => {
  const { query, filter, city } = req.query;
  const regex = new RegExp(query, 'i');
  try {
    let results = [];

    if (filter === 'shops') {
      results = await Shop.find({ shop_name: regex, city_district: city });
    } else if (filter === 'farmers') {
      results = await Farmer.find({ name: regex, city_district: city });
    } else if (filter === 'products') {
      const shops = await Shop.find({ city_district: city });
      const shopIds = shops.map(s => s._id);
      results = await Product.find({ name: regex, shop_id: { $in: shopIds } });
    }

    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Search failed' });
  }
};


module.exports = {
  registerCustomer,
  loginCustomer,
  getCustomerById,
  updateCustomer,
  sendOtptoCustomer,
  verifyCustomerOtp,
  searchByNameAndCity
};

const Customer = require('../models/Customer');
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


module.exports = { registerCustomer, loginCustomer, getCustomerById, updateCustomer };

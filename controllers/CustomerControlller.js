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
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(customer._id, 'customer');
    res.status(200).json({ message: 'Login successful', token, customer });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { registerCustomer, loginCustomer };
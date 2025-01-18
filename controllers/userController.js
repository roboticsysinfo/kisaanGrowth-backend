const User = require('../models/User');
const generateToken = require('../utils/jwtGenerator');

// Register a new user (Farmer, Customer, Admin, Sub Admin)
const registerUser = async (req, res) => {
  const { name, email, password, phoneNumber, address, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user
    const user = new User({
      name,
      email,
      password,
      phoneNumber,
      address,
      role,
      verified: role === 'farmer' ? false : true, // Only farmers need verification
    });

    await user.save();

    res.status(201).json({ 
      message: 'User registered successfully', 
      user: { 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        verified: user.verified 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};



// User Login (with role-based access)
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);

    // Farmer-specific logic
    if (user.role === 'farmer') {
      if (!user.verified) {
        return res.status(403).json({ 
          message: 'Account not verified. Complete KYC process.', 
          token, 
          user: { ...user._doc, verified: user.verified },
        });
      }

      if (!user.address || !user.phoneNumber) {
        return res.status(200).json({
          message: 'Login successful, but profile incomplete.',
          token,
          user: { ...user._doc, profileIncomplete: true },
        });
      }
    }

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        verified: user.verified 
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};



// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password field
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a user by ID (Admin or the user themself)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password'); // Exclude password field
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user details (Admin or the user themself)
const updateUserVerification = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'farmer') {
      return res.status(400).json({ message: 'Verification is only applicable for farmers.' });
    }

    user.verified = true;
    await user.save();

    res.status(200).json({ message: 'Farmer verified successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: `User ${user.email} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUserVerification,
  deleteUser,
};

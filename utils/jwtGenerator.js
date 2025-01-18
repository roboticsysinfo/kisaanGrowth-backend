const jwt = require('jsonwebtoken');

// Function to generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET, // Use the secret from environment variable
    { expiresIn: '1h' } // Token expiration time
  );
};

module.exports = generateToken;

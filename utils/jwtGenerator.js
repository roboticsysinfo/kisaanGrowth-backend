const jwt = require('jsonwebtoken');

// Function to generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    'JWT_SECRET', // Replace with your actual secret
    { expiresIn: '1h' } // Token expiration time
  );
};

module.exports = generateToken;

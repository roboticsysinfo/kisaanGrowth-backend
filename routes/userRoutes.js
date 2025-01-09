const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// Register a user (Farmer, Customer, Admin, Sub Admin)
router.post('/register', registerUser);

// User login
router.post('/login', loginUser);

// Admin routes for managing users
router.get('/users', protect(['admin']), getAllUsers);  // Admin can view all users
router.get('/users/:id', protect(['admin']), getUserById); // View user by ID
router.put('/users/:id', protect(['admin']), updateUser); // Update user details
router.delete('/users/:id', protect(['admin']),  deleteUser); // Delete a user

module.exports = router;

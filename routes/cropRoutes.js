const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } = require('../controllers/categoryController');



router.post('/category', protect(['admin', 'farmer', 'sub_admin']), createCategory); 
router.get('/categories',  getAllCategories);  
router.get('/category/:id', protect(['admin', 'farmer', 'sub_admin']), getCategoryById); 
router.put('/category/:id', protect(['admin', 'farmer', 'sub_admin']), updateCategory); 
router.delete('/category/:id', protect(['admin', 'farmer', 'sub_admin']),  deleteCategory); 

module.exports = router;

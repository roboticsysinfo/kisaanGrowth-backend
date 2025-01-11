const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { createCategory, getAllCategories, updateCategory, deleteCategory } = require('../controllers/categoryController');



router.post('/category', protect(['admin', 'sub_admin']), createCategory); 
router.get('/categories',  getAllCategories);  
router.put('/category/:id', protect(['admin','sub_admin']), updateCategory); 
router.delete('/category/:id', protect(['admin','sub_admin']),  deleteCategory); 

module.exports = router;

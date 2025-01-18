const express = require('express');
const router = express.Router();
const { authorize } = require('../middlewares/authMiddleware');
const { createCategory, getAllCategories, updateCategory, deleteCategory } = require('../controllers/categoryController');
const upload = require('../middlewares/upload')


router.post('/category', upload.single('category_image'), authorize(['admin', 'sub_admin']), createCategory); 
router.get('/categories',  getAllCategories);  
router.put('/category/:id', authorize(['admin','sub_admin']), updateCategory); 
router.delete('/category/:id', authorize(['admin','sub_admin']),  deleteCategory); 

module.exports = router;

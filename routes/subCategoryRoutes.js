const express = require('express');
const router = express.Router();
const { authorize } = require('../middlewares/authMiddleware');
const { createSubCategory, getAllSubCategories, updateSubCategory, deleteSubCategory } = require('../controllers/subCategoryController');

router.post('/sub-category', authorize(['admin', 'sub_admin']), createSubCategory); 
router.get('/sub-categories',  getAllSubCategories);  
router.put('/sub-category/:id', authorize(['admin','sub_admin']), updateSubCategory); 
router.delete('/sub-category/:id', authorize(['admin','sub_admin']),  deleteSubCategory); 

module.exports = router;

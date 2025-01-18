const express = require('express');
const router = express.Router();
const { authorize } = require('../middlewares/authMiddleware');
const { createReview, getAllReviews, updateReview, deleteReview } = require('../controllers/reviewController');



router.post('/create-review', authorize(['customer','admin', 'sub_admin']), createReview); 
router.get('/products', authorize, getAllReviews);  
router.put('/product/:id', authorize(['admin', 'customer', 'sub_admin']), updateReview); 
router.delete('/product/:id', authorize(['admin', 'farmer', 'sub_admin']),  deleteReview); 

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { createReview, getAllReviews, updateReview, deleteReview } = require('../controllers/reviewController');



router.post('/create-review', protect(['customer','admin', 'sub_admin']), createReview); 
router.get('/products', protect, getAllReviews);  
router.put('/product/:id', protect(['admin', 'customer', 'sub_admin']), updateReview); 
router.delete('/product/:id', protect(['admin', 'farmer', 'sub_admin']),  deleteReview); 

module.exports = router;

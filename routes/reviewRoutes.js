const express = require("express");
const { createReview, getAllReviews, getReviewById, updateReview, deleteReview, getReviewsByCustomerId } = require("../controllers/reviewController");
const { authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/create_review", authorize(['customer']), createReview); // ✅ Create Review


router.get("/review/:shop_id", getAllReviews); // ✅ Get All Reviews for a Shop


router.get("/review/single/:id", getReviewById); // ✅ Get Review By ID


router.put("/update_review/:id", authorize(['customer']), updateReview); // ✅ Update Review


router.delete("/delete_review/:id", authorize(['customer', 'farmer', 'admin']), deleteReview); // ✅ Delete Review


// ✅ Get Reviews by Customer ID
router.get("/reviews/:customerId", authorize(['customer']), getReviewsByCustomerId);


module.exports = router;

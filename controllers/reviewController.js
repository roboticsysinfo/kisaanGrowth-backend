const { sendNotification } = require("../helper/sendNotification");
const Review = require("../models/Review");
const Shop = require("../models/Shop");

// ✅ Create a Review
// const createReview = async (req, res) => {
//   try {
//     const { shop_id, rating, comment } = req.body;

//     const farmerId =  req.user_id

//     if (!shop_id || !rating) {
//       return res.status(400).json({ message: "Shop ID and rating are required" });
//     }

//     const newReview = new Review({
//       shop_id,
//       user_id: req.user._id, // Assuming user is authenticated
//       rating,
//       comment,
//     });

//     await newReview.save();

//     await sendNotification(farmerId, "review", "A new review has been submitted on your shop.");
//     res.status(201).json({ message: "Review submitted successfully", review: newReview });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }

// };

const createReview = async (req, res) => {
  try {
    const { shop_id, rating, comment } = req.body;

    if (!shop_id || !rating) {
      return res.status(400).json({ message: "Shop ID and rating are required" });
    }

    const shop = await Shop.findById(shop_id);
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const userId = shop.owner_id; // Fetching farmer's ID from shop\

    console.log("Notification Rec id", userId)

    const newReview = new Review({
      shop_id,
      user_id: req.user._id, // Assuming user is authenticated
      rating,
      comment,
    });

    console.log("New Review", newReview)

    await newReview.save();

    await sendNotification(userId, "review", "A new review has been submitted on your shop.");
    
    res.status(201).json({ message: "Review submitted successfully", review: newReview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



// ✅ Get All Reviews for a Shop
const getAllReviews = async (req, res) => {
  try {
    const { shop_id } = req.params;

    if (!shop_id) {
      return res.status(400).json({ message: "Shop ID is required" });
    }

    const reviews = await Review.find({ shop_id }).populate("user_id", "name"); 

    // ✅ Calculate Overall Rating
    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews
        : 0;

    res.status(200).json({ reviews, averageRating: avgRating.toFixed(1) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Get Review By ID
const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id).populate("user_id", "name");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Get Reviews by Customer ID
const getReviewsByCustomerId = async (req, res) => {

    try {
      const { customerId } = req.params;
  
      if (!customerId) {
        return res.status(400).json({ message: "Customer ID is required" });
      }
  
      // Fetch reviews based on user_id (customer ID)
      const reviews = await Review.find({ user_id: customerId }).populate("shop_id", "shop_name");
  
      res.status(200).json(reviews);
    } catch (error) {
      console.error("Error fetching reviews by customer ID:", error);
      res.status(500).json({ message: "Server error" });
    }

  };


// ✅ Update Review
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    res.status(200).json({ message: "Review updated successfully", review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete Review
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    await review.deleteOne();

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getReviewsByCustomerId
};

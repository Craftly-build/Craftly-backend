//Routes for Reviews
const express = require("express");
const router = express.Router();
const Review = require("../models/Review");

// GET route for the Review for Products
router.get("/products/:id/reviews", async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.id });
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});
//POST route for creating a new Review
router.post("/products/:id/reviews", async (req, res) => {
  // const { rating, comment } = req.body;
   const productId = req.params.id;
   console.log("Product ID:", productId);
  try {
    const { author, rating, comment } = req.body;

    const review = new Review({
      productId: req.params.id,
      author,
      rating,
      comment,
    });

    await review.save();

    res.status(201).json({ message: "Review added successfully", review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create review" });
  }
});
// PUT route for updating a Review
router.put("/products/:productId/reviews/:reviewId", async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { rating, comment },
      { new: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({ message: "Review updated successfully", updatedReview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update review" });
  }
});
// DELETE route for deleting a Review
router.delete("/products/:productId/reviews/:reviewId", async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.reviewId);

    if (!deletedReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete review" });
  }
});
module.exports = router;

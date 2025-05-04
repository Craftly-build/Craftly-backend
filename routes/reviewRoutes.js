//Routes for Reviews
const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// GET route for the Review for Products
router.get('/products/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.id });
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

module.exports = router;

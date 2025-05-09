// This file is for the cartegory for all products, it will help list and item all products.

const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const {RequireAuth, checkRole} = require('../middleware/auth');
const asyncHandler = require('../middleware/async');


// GET /api/categories - List all unique categories
// This is public route , which is accessble to all users. 

router.get('/categories', asyncHandler(async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch categories' });
  }
}));


// GET /api/categories/:id/products - Get products by category
// This is public route , which is accessble to all users. 

router.get('/categories/:id/products', asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch products by category' });
  }
}));

module.exports = router;

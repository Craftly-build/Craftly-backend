// This file is for the cartegory for all products, it will help list and item all products.

const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/categories - List all unique categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch categories' });
  }
});

// GET /api/categories/:id/products - Get products by category
router.get('/categories/:id/products', async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch products by category' });
  }
});

module.exports = router;

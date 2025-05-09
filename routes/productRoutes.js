const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const {requireAuth, checkRole} = require('../middleware/auth');
const asyncHandler = require('../middleware/async');


// GET /api/products - List products with filtering, sorting, pagination. 
//Note that this is public route that everyone will have access to.

router.get('/products', asyncHandler(async (req, res) => {
  try {
    const { category, search, sortBy, page = 1, limit = 10 } = req.query;
    const query = {};

    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    let productsQuery = Product.find(query);

    if (sortBy === 'price-low') productsQuery = productsQuery.sort({ price: 1 });
    else if (sortBy === 'price-high') productsQuery = productsQuery.sort({ price: -1 });
    else if (sortBy === 'newest') productsQuery = productsQuery.sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);
    const products = await productsQuery
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ total, page: Number(page), limit: Number(limit), products });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
}));


// GET /api/products/:id - Get product details
//Note that this is public route that everyone will have access to.

router.get('/products/:id', asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
}));


// POST /api/products - Create new product
//This can only be accessed by authenticated users with admin role, which makes it a protected route.

router.post('/products', asyncHandler(async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Error creating product', error });
  }
}));

// GET /api/products/trending - Get trending products
//This is public route that will be accessed by any user on the application.

router.get('/trending/products', asyncHandler(async (req, res) => {
  try {
    const trending = await Product.find({ trending: true }).limit(10);
    res.json(trending);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trending products', error });
  }
}));


// PUT /api/products/:id - Update product
//This can only be accessed by authenticated users with admin role, which makes it a protected route.

router.put('/products/:id', asyncHandler (async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Error updating product', error });
  }
}));



// DELETE /api/products/:id - Delete product
//This can only be accessed by authenticated users with admin role, which makes it a protected route.

router.delete('/products/:id',requireAuth, checkRole('admin'), asyncHandler(async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
}));



// GET /api/products/featured - Get featured products
//This is public route that will be accessed by any user on the application.

router.get('/featured/products', asyncHandler(async (req, res) => {
  try {
    const featured = await Product.find({ featured: true }).limit(10);
    res.json(featured);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching featured products', error });
  }
}));

// GET /api/products/related/:id - Get related products
//This is public route that will be accessed by any user on the application.

router.get('/related/products:id', asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    }).limit(6);

    res.json(related);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching related products', error });
  }
}));

module.exports = router;
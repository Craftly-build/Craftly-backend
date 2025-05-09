// This file is for shopping cart logic and function , for the add , delete , remove ,edit 

const express = require("express");
const router = express.Router();
const {requireAuth} = require('../middleware/auth');
const asyncHandler = require('../middleware/async');

// Utility functions

function isProductInCart(cart, id) {
  return cart.some((item) => item.id === id);
}

function calculateTotal(cart, req) {
  let total = 0;
  for (let item of cart) {
    const price = item.sale_price || item.price;
    total += price * item.quantity;
  }
  req.session.total = total;
  return total;
}

// GET Cart : This will be be available for anyone one (Guests and authenticated users.)

router.get("/cart", asyncHandler(async(req, res) => {
  const cart = req.session.cart || [];
  const total = req.session.total || 0;

  if (req.oidc && req.oidc.isAuthenticated()) {
    return res.json({
      cart,
      total,
      user: {
        id: req.oidc.user.sub,
        email: req.oidc.user.email,
      }
    });
  }
  res.json({ cart, total });
}));



// POST Add to Cart: This will be be available for anyone one (Guests and authenticated users.)

router.post("/addtocart", asyncHandler(async(req, res) => {
  console.log("Add to cart route hit");
  const product = req.body.product;

  if (!product) {
    return res.status(400).json({
      message: "No product provided",
    });
  }

  let cart = req.session.cart || [];
  const existingProduct = cart.find((item) => item.id === product.id);

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  req.session.cart = cart;
  const total = calculateTotal(cart, req);
  res.json({ cart, total });
}));


// POST Remove Product: This will be be available for anyone one (Guests and authenticated users).

router.post("/removeproduct", asyncHandler(async(req, res) => {
  const id = req.body.id;
  let cart = req.session.cart || [];

  cart = cart.filter((item) => item.id !== id);

  req.session.cart = cart;
  const total = calculateTotal(cart, req);
  res.json({ cart, total });
}));


// POST Edit Product Quantity: This will be be available for anyone one (Guests and authenticated users).
router.post("/editProductQuantity", asyncHandler(async (req, res) => {
  const { id, action } = req.body;
  let cart = req.session.cart || [];

  cart = cart.map((item) => {
    if (item.id === id) {
      const quantity =
        action === "increase"
          ? item.quantity + 1
          : Math.max(1, item.quantity - 1);
      return { ...item, quantity };
    }
    return item;
  });

  req.session.cart = cart;
  const total = calculateTotal(cart, req);
  res.json({ cart, total });
}));



// POST Place Order: On this , the protected route will require authentication
router.post("/placeorder", requireAuth, asyncHandler(async (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) {
    return res.status(400).json({ message: "Cart is empty, cannot place order." });
  }

  // This helps store or save order in the mongodb.
  req.session.cart = [];
  req.session.total = 0;
  res.json({ message: "Order placed successfully",
    user: {
      id: req.oidc.user.sub,
      email: req.oidc.user.email
    }
  });
}));

// GET Payment: On this , the protected route will require authentication
router.get("/payment", requireAuth,asyncHandler (async (req, res) => {
  const total = req.session.total || 0;
  if (total === 0) {
    return res.status(400).json({
      message: "Cart is empty, cannot complete the payment",
    });
  }
// to iniatilise payment witht the third party payment provider.
  res.json({ message: "Proceed to payment", total ,
    user: {
      id:req.oidc.user.sub,
      email: req.oidc.user.email
    }


  });
}));

module.exports = router;

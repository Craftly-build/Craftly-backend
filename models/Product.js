const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    stock: {
      type: Number,
      required: true,
      default: 0
    },
    images: 
      {
        type: [String],// store image path like "/images/product1.jpg"
        required: true
         
      },
    
    featured: {
      type: Boolean,
      default: false
    },
    trending: {
      type: Boolean,
      default: false
    },
    artisan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // if you're linking to a user/creator model
      required: false
    }
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

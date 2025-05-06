const mongoose = require('mongoose');

const PortfolioItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  images: [String],
  date: {
    type: Date,
    default: Date.now
  },
  featured: {
    type: Boolean,
    default: false
  }
});

const PortfolioSchema = new mongoose.Schema({
  artisan: {
    type: mongoose.Schema.ObjectId,
    ref: 'Artisan',
    required: true,
    unique: true
  },
  headline: {
    type: String,
    trim: true
  },
  about: {
    type: String,
    maxlength: [1000, 'About section cannot be more than 1000 characters']
  },
  skills: [String],
  achievements: [String],
  socialLinks: {
    website: String,
    instagram: String,
    facebook: String,
    etsy: String,
    pinterest: String
  },
  galleryImages: [String],
  portfolioItems: [PortfolioItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
PortfolioSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);
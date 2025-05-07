// Model for Review
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    productId: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required:true
    },

    author: {
        type: String, 
        required: true
    },

    comment: {
        type: String,
        required: true,
        trim: true,
        
    },

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 4
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Review', ReviewSchema);
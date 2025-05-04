// Model for Review
const mongoose = requre('mongoose');

const ReviewSchema = new mongoose.Schema({
    productId: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required:true
    },

    reviewerName: {
        type: String, 
        required: true
    },

    Comment: {
        type: Number,
        required: true,
        min:1,
        max:4
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
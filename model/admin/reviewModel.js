const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true 
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  rating: {
    type: Number,
    required: true,
    min: 1, 
    max: 5 
  },
  reviewText: {
    type: String,
    maxlength: 500
  },
  reviewDate: {
    type: Date,
    default: Date.now 
  }
});

module.exports = {
  Review:mongoose.model('Review',reviewSchema),
};
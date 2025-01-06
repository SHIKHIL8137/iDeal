const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0, 
  }, discountCap: {
    type: Number, 
    required: false, 
  },
  minOrderAmount: {
    type: Number,
    required: true,
    default: 0, 
  },
  validFrom: {
    type: Date,
    required: true,
  },
  validTill: {
    type: Date,
    required: true,
  },
  applicableTo: {
    type: String,
    enum: ['Product', 'Category'], 
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true, 
  },

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: function() { return this.applicableTo === 'product'; },
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: function() { return this.applicableTo === 'category'; },
  },
}, {
  timestamps: true, 
});

module.exports = {
  Offer:mongoose.model('Offer',offerSchema),
};
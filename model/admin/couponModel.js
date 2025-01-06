const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true, 
  },
  description: {
    type: String,
    required: true, 
    trim: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 1,
    max: 100, 
  },
  maxDiscountAmount: {
    type: Number,
    default: null,
  },
  minOrderAmount: {
    type: Number,
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
  isActive: {
    type: Boolean,
    default: true, 
  },
  usageLimit: {
    type: Number,
    default: null, 
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  usersUsed: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt:{
    type : Date,
    default : Date.now
  }
});

module.exports = {
  Coupon:mongoose.model('Coupon',couponSchema),
}
const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  referredUserIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  }],
  referralCode: {
    type: String,
    required: true,
    unique: true, 
  },
  createdAt: {
    type: Date,
    default: Date.now,  
  },
  rewardAmount: {
    type: Number,
    default: 0,  
  },
});

module.exports = {
  Referral : mongoose.model('Referral',referralSchema),
};
const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  balance: {
    type: Number,
    default: 0, 
    min: 0,
  },
  transactions: [{
    transactionId: {
      type: String,
    },
    type: {
      type: String,
      enum: ['credit', 'debit'], 
    },
    amount: {
      type: Number,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = {
  Wallet : mongoose.model('Wallet',walletSchema),
};
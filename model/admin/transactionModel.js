const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customer:{
type : String,
required : true
  },
  transactionType: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  transactionId: {
    type: String,
    unique: true,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['COD','razorPay', 'Wallet'],
    required: true,
  },
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
  Transaction : mongoose.model('Transaction',transactionSchema),
}
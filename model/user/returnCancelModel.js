const mongoose = require('mongoose');

const returnCancelSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Orders',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', 
  },
  productQauntity : {
    type: Number,
  },
  paymentMethod: {
    type: String,
    enum: ['razorPay', 'COD', 'Wallet'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Unpaid'],
    required: true,
  },
  reason: {
    type: String,
    required: true,
    maxlength: 500, 
  },
  isReturn: {
    type: Boolean,
    required: true, 
  },
  adminStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default : 'Pending',
    required: function () {
      return this.isReturn; 
    },
  },
  pickupStatus: {
    type: String,
    enum: ['Not Scheduled', 'Scheduled', 'In Transit', 'Completed'],

    required: function () {
      return this.isReturn; 
    },
  },
  refundStatus: {
    type: String,
    enum: ['In Process', 'Completed'],
    default : 'In Process',
    required: function () {
      return this.isReturn; 
    },
  },
  reasonForRejection: { 
    type: String, 
    default: '' ,
  }
  ,
  refundAmount: {
    type: Number,
    required: function () {
      return this.paymentStatus === 'Paid'; 
    },
  },
  pickupAddress: {
    type: {
      fname: { 
        type: String, 
        required: true 
      },
      lname: { 
        type: String, 
        required: true 
      },
      companyName: { 
        type: String 
      },
      houseName: { 
        type: String 
      },
      country: { 
        type: String, 
        required: true 
      },
      state: { 
        type: String, 
        required: true 
      },
      city: { 
        type: String, 
        required: true 
      },
      zipCode: { 
        type: String, 
        required: true 
      },
      email: { 
        type: String, 
        required: true, 
        match: /\S+@\S+\.\S+/ 
      },
      phone: { 
        type: String, 
        required: true 
      },
    },
    required: function () {
      return this.isReturn === true;
    },
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



returnCancelSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});


module.exports = {
  ReturnCancel : mongoose.model('ReturnCancel',returnCancelSchema),
};

const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
      },
      quantity: {
        type: Number,
        min: 1, 
      },
      price: {
        type: Number,
      },
      actualPrice: {
        type: Number,
      },
      totalPrice: {
        type: Number,
        default: function () {
          return this.quantity * this.price;
        },
      },
      totalActualPrice : {
        type: Number,
        default: function () {
          return this.quantity * this.actualPrice;
        },
      }
    },
  ],
  totalAmount: {
    type: Number,
    default: 0,
  },
  totalActualAmount: {
    type: Number,
    default: 0,
  },
  totalDiscountAmount: {
    type: Number,
    default: 0,
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

const checkoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },cartId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart', 
    required: true
  },
  deliveryFee: {
    type: Number,
    required: true,
  },
  finalTotal: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  categoryDiscount:{
    type:Number,
    default : 0
  }
});

module.exports = {
  Cart:mongoose.model('Cart',cartSchema),
  CheckOut : mongoose.model('CheckOut',checkoutSchema),
};
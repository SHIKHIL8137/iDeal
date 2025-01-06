const mongoose = require('mongoose');

const pendingOrderSchema = new mongoose.Schema({
  razorPayOrderId :{
    type :String,
  },
  orderId: { 
    type: String, 
    required: true, 
    unique: true 
  }, 
  userId: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User', 
     required: true 
    },
  pendingStatus:{
    type : String,
    default : 'Pending-Payment'
  },
  paymentStatus: { 
    type: String, 
    enum: ['Paid', 'Unpaid'], 
    required: true 
  },
  paymentMethod: { 
    type: String, 
    enum: ['COD','razorPay', 'Wallet'], 
    required: true 
  }, 

  deliveryAddress: { 
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
      required: true, 
    }, 
  },
  billingAddress: {
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
      required: true, 
    }
  },
  products: [
    {
      productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
      },
      productName: {
        type : String,
        required : true,
      },
      firstImage: {
        type : String,
        required : true
      },
      productColor:{
        type : String,
        required :true
      },
      productStorage :{
        type : Number,
        required : true
      },
      quantity: { 
        type: Number, 
        required: true 
      }, 
      price: { 
        type: Number, 
        required: true 
      }, 
      total: { 
        type: Number, 
        required: true 
      },
      returnStatus:{
        type : Boolean,
        default : false,
      } 
    }
  ],
  subtotal: { 
    type: Number, 
    required: true 
  }, 
  discount: { 
    type: Number, 
    default: 0 
  }, 
  totalAmount: { 
    type: Number, 
    required: true 
  },
  appliedCoupon :{
    type : String
  },
  appliedDiscountPercentage :{
   type : Number,
  }
  ,
  couponDiscount :{
    type : Number,
    default : 0
  },
  total_Amt_WOT_Discount :{
    type:Number,
    default : 0
  },
  deliveryFee :{
    type : Number,
    default : 0
  },
  createdAt: {
    type: Date,
    default: Date.now, 
  },
});

module.exports = {
  PendingOrder : mongoose.model('PendingOrder',pendingOrderSchema),
};
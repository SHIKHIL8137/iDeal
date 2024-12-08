const mongoose = require('mongoose');


const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true, 
    },
    profilePicture: {
       type: String 
    },
    firstName: {
      type: String
    },
    lastName: {
     type : String
    },
    username: {
      type: String,
      unique:false,
      required: true,
    },
    addresses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address', 
      },
    ],
    password: {
      type: String,
      required: false,
      default: null
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, 'Invalid email format'],
    },
    phone: {
      type: String, 
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v); 
        },
        message: 'Phone number must be a valid 10-digit number',
      },
    },
    secondEmail: {
      type: String,
      match: [/\S+@\S+\.\S+/, 'Invalid email format'],
    },
    block: {
      type: Boolean,
      default: false,
    },
    orders: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Orders' 
    }]
  },
  { timestamps: true } 
);


const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    fname: String,
    lname: String,
    companyName: String,
    houseName: String,
    country: String,
    state: String,
    city: String,
    zipCode: {
      type: String, 
      validate: {
        validator: function (v) {
          return /^[0-9]{5,6}$/.test(v); 
        },
        message: 'Zip Code must be 5-6 digits',
      },
    },
    email: {
      type: String,
      match: [/\S+@\S+\.\S+/, 'Invalid email format'],
    },
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v); 
        },
        message: 'Phone number must be a valid 10-digit number',
      },
    },
  },
  { timestamps: true }
);

const otpSchema= new mongoose.Schema({
 email:{
 type:String,
 required:true,
 lowercase:true,
 match: [/\S+@\S+\.\S+/, 'Please enter a valid email address']
 },
 otp:{
  type:String,
  required:true,
 },
 expiresAt:{
  type:Date,
  required:true,
 },
 type: {
  type: String,
  enum: ['otpVerification', 'resetPassword'], 
  default: 'otpVerification',
},
 createdAt:{
  type:Date,
  default:Date.now
 }

})

otpSchema.index({createdAt:1},{expireAfterSeconds:600})

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
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1, 
      },
      price: {
        type: Number,
        required: true,
      },
      totalPrice: {
        type: Number,
        required: true,
        default: function () {
          return this.quantity * this.price;
        },
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
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
  discount: {
    type: Number,
    default: 0,
  },
  deliveryFee: {
    type: Number,
    required: true,
  },
  finalTotal: {
    type: Number,
    required: true,
  },
  appliedCoupon: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});



const orderSchema = new mongoose.Schema({
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
  orderDate: { 
    type: Date, 
    default: Date.now 
  },
  status: {
     type: String, 
     enum: ['Processing','Delivered', 'Cancelled'], 
     default: 'Pending' },
  paymentStatus: { 
    type: String, 
    enum: ['Paid', 'Unpaid', 'Refund Initiated'], 
    required: true 
  },
  paymentMethod: { 
    type: String, 
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
  orderConformStatus:{
      type:String
  },
  appliedCoupon :{
    type : String
  }
});



const wishlistSchema = new mongoose.Schema(
  {
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
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
)
















module.exports = {
  User: mongoose.model('User', userSchema),
  Address: mongoose.model('Address', addressSchema),
  OTP:mongoose.model('OTP',otpSchema),
  Cart:mongoose.model('Cart',cartSchema),
  CheckOut : mongoose.model('CheckOut',checkoutSchema),
  Orders : mongoose.model('Orders',orderSchema),
  WishList : mongoose.model('WishList',wishlistSchema),
};

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





module.exports = {
  User: mongoose.model('User', userSchema),
  Address: mongoose.model('Address', addressSchema),
  OTP:mongoose.model('OTP',otpSchema),
  Cart:mongoose.model('Cart',cartSchema),
  CheckOut : mongoose.model('CheckOut',checkoutSchema),
};

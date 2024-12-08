const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String, 
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', 
    required: false,
    default:null
  },
  brand: {
    type: String,
    default: 'Apple',
  },
  description: {
    type: String,
    required: true,
  },
  condition: {
    type: String,
    default: 'good',
  },
  storage: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: false,
  },
  Dprice: {
    type: Number,
    required: false,
  }
  ,
  stock: {
    type: Number,
    default: 0,
  },
  images:{
   type: [String],
   required:true
  } ,
  connectivity: {
    type: String,
    required: true,  
  },reviews: [
    { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review' }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});


const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  status: {
    type:Boolean,
    default: true,
  },
  createdAt:{
    type:Date,
    default:Date.now
  }
});



const adminSchema=new mongoose.Schema({
name:{
  type:String,
  required:true,
},
email:{
  type:String,
  required:true
},
password:{
  type:String,
  required:true,
},
createdAt:{
  type:Date,
  default:Date.now
}
})


const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true 
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  rating: {
    type: Number,
    required: true,
    min: 1, 
    max: 5 
  },
  reviewText: {
    type: String,
    maxlength: 500
  },
  reviewDate: {
    type: Date,
    default: Date.now 
  }
});




const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true, // Ensure coupon code is stored in uppercase
  },
  description: {
    type: String,
    required: true, // Adding description as mandatory
    trim: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 1,
    max: 100, // Ensures valid percentage range
  },
  maxDiscountAmount: {
    type: Number,
    default: null, // Maximum discount amount
  },
  minOrderAmount: {
    type: Number,
    default: 0, // Minimum order amount to apply the coupon
  },
  validFrom: {
    type: Date,
    required: true, // Start date for coupon validity
  },
  validTill: {
    type: Date,
    required: true, // End date for coupon validity
  },
  isActive: {
    type: Boolean,
    default: true, // Indicates if the coupon is currently active
  },
  usageLimit: {
    type: Number,
    default: null, // Maximum times the coupon can be used
  },
  usageCount: {
    type: Number,
    default: 0, // Tracks the number of times the coupon has been used
  },
  usersUsed: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to users who used this coupon
    },
  ],
});









module.exports = {
  Product:mongoose.model('Product',productSchema),
  Category:mongoose.model('Category',categorySchema),
  Admin:mongoose.model('Admin',adminSchema),
  Review:mongoose.model('Review',reviewSchema),
  Coupon:mongoose.model('Coupon',couponSchema),
};
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
    uppercase: true, 
  },
  discountPercentage: {
    type: Number,
    required: true,
  },
  minOrderAmount: {
    type: Number, 
    default: 0,
  },
  maxDiscountAmount: {
    type: Number, 
    default: null,
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
});








module.exports = {
  Product:mongoose.model('Product',productSchema),
  Category:mongoose.model('Category',categorySchema),
  Admin:mongoose.model('Admin',adminSchema),
  Review:mongoose.model('Review',reviewSchema),
  Coupon:mongoose.model('Coupon',couponSchema),
};
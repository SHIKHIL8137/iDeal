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
  offer:{
    type : Boolean,
    default : false,
  }
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
  },
  offer:{
    type : Boolean,
    default : false,
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
  description: {
    type: String,
    required: true, 
    trim: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 1,
    max: 100, 
  },
  maxDiscountAmount: {
    type: Number,
    default: null,
  },
  minOrderAmount: {
    type: Number,
    default: 0, 
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
  createdAt:{
    type : Date,
    default : Date.now
  }
});




const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0, 
  }, discountCap: {
    type: Number, 
    required: false, 
  },
  minOrderAmount: {
    type: Number,
    required: true,
    default: 0, 
  },
  validFrom: {
    type: Date,
    required: true,
  },
  validTill: {
    type: Date,
    required: true,
  },
  applicableTo: {
    type: String,
    enum: ['Product', 'Category'], 
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true, 
  },

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: function() { return this.applicableTo === 'product'; },
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: function() { return this.applicableTo === 'category'; },
  },
}, {
  timestamps: true, 
});


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


const bannerSchema = new mongoose.Schema({
  home_image: {
    type: String,
    required: true, 
  },
  offer_banner: {
    type: String,
    required: true, 
  },
  created_at: {
    type: Date,
    default: Date.now, 
  },
});


module.exports = {
  Product:mongoose.model('Product',productSchema),
  Category:mongoose.model('Category',categorySchema),
  Admin:mongoose.model('Admin',adminSchema),
  Review:mongoose.model('Review',reviewSchema),
  Coupon:mongoose.model('Coupon',couponSchema),
  Offer:mongoose.model('Offer',offerSchema),
  Transaction : mongoose.model('Transaction',transactionSchema),
  Banner : mongoose.model('Banner',bannerSchema),
};
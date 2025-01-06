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
module.exports = {
  Product:mongoose.model('Product',productSchema),
};
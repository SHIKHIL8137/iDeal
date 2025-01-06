const mongoose = require('mongoose');

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

 module.exports = {
   OTP:mongoose.model('OTP',otpSchema),
 };
 
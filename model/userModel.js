const mongoose = require('mongoose');


const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true, 
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
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
    },
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










module.exports = {
  User: mongoose.model('User', userSchema),
  Address: mongoose.model('Address', addressSchema),
  OTP:mongoose.model('OTP',otpSchema),
};

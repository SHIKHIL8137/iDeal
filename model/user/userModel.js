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

module.exports = {
  User: mongoose.model('User', userSchema),
};
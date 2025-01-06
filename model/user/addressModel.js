const mongoose = require('mongoose');

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

module.exports = {
  Address: mongoose.model('Address', addressSchema),
};
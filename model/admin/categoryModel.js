const mongoose = require('mongoose');

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

module.exports = {
  Category:mongoose.model('Category',categorySchema),
};
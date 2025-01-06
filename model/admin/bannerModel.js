const mongoose = require('mongoose');

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
  Banner : mongoose.model('Banner',bannerSchema),
};
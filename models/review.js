const mongoose = require('mongoose')
const Schema = mongoose.Schema

// these need to be changed
const ReviewSchema = new Schema({
  title: String,
  image: String,
  price: Number,
  description: String,
  location: String
});

module.exports = mongoose.model('Review', ReviewSchema);

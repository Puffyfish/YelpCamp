const mongoose = require('mongoose')

// define a model for mongoose to easier interact with mongodb
const Schema = mongoose.Schema

// mapping of different collection keys from mongo to different types in JS
const CampgroundSchema = new Schema({
  title: String,
  price: String,
  description: String,
  location: String
});

// 2 parameters:
// name of model(capitalized & singular; will make a collection after (plural & lowercased)
// name of schema
module.exports = mongoose.model('Campground', CampgroundSchema);

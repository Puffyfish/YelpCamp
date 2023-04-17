const mongoose = require('mongoose')
const Review = require('./review')

// define a model for mongoose to easier interact with mongodb
const Schema = mongoose.Schema

// mapping of different collection keys from mongo to different types in JS
const CampgroundSchema = new Schema({
  title: String,
  image: String,
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  ]
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
      await Review.deleteMany({
          _id: {
              $in: doc.reviews
          }
      })
  }
})

// 2 parameters:
// name of model(capitalized & singular; will make a collection after (plural & lowercased)
// name of schema
module.exports = mongoose.model('Campground', CampgroundSchema);

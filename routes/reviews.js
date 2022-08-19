const express = require('express');
const router = express.router({mergeParams: true});
const Campground = require('../models/campground');
const Review = require('../models/review');

const { reviewSchema} = require ('../schemas.js'); // i dont know what this is
// variables that deal with errors
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const ObjectID = require('mongoose').Types.ObjectId;

const validateReview = (req, res, next) => {
  const {error} = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el=>el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
  console.log(msg);
}

router.post('/', validateReview, catchAsync(async (req, res, next) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
})

router.delete('/:reviewId', catchAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/campgrounds/${campground._id}`);
}))
);

const express = require('express');
const router = express.Router({mergeParams: true});
// so we will have access to the params based from campgrounds
const Campground = require('../models/campground');
const Review = require('../models/review');

// variables that deal with errors
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const { isLoggedIn, validateCampground, validateReview } = require('../middleware');

router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res, next) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:reviewId', isLoggedIn, catchAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);
  // res.redirect(`/campgrounds/${campground._id}`);
  res.redirect(`/campgrounds/${id}`);
}));

module.exports = router
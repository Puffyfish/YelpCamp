const express = require('express');
const router = express.router({mergeParams: true});
const Campground = require('../models/campground');
const Review = require('../models/review');

const { reviewSchema} = require ('../schemas.js'); // i dont know what this is
// variables that deal with errors
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const ObjectID = require('mongoose').Types.ObjectId;

const validateCampground = (req, res, next) => {
  const {error} = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el=>el.message).join(',') // map to make a single string
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
  console.log(msg);
}

router.get('/campgrounds', async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', {campgrounds});
});

// route to adding new campground
router.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
})

// route after adding a new campground (it goes to /campgrounds)
router.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => { //catchAsync is a class Error used instead of using the usual try and catch
  const campground = new Campground(req.body.campground);
  //default, res.body is empty bc it has not been parsed so must add app.use(express.urlencoded({extended: true}));
  await campground.save();
  req.flash('success', 'You have successfully created a new campground!');
  res.redirect(`/campgrounds/${campground._id}`);
})
);

// to show page of a specific campground ID
router.get('/campgrounds/:id', catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) {
    return next( new ExpressError('Incorrect ID', 400));
  }
  const campground = await Campground.findById(id);
  if(!campground) {
    return next( new ExpressError('Campground not found', 404));
  }
  res.render('campgrounds/show', { campground });
}));

router.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id)
  res.render('campgrounds/edit', {campground});
}))

// to edit/update campground info
router.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/campgrounds/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect('/campgrounds');
}))

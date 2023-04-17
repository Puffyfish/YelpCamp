const express = require('express');
const router = express.Router(); // dont need to merge params bc it has access to its own params
const { isLoggedIn, validateCampground } = require('../middleware');
const Campground = require('../models/campground');

// variables that deal with errors
const catchAsync = require('../utils/catchAsync');

// const ObjectID = require('mongoose').Types.ObjectId;

router.get('/', async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', {campgrounds});
});

// route to adding new campground
router.get('/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
})

// route after adding a new campground (it goes to /campgrounds)
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => { 
  //catchAsync is a class Error used instead of using the usual try and catch
  const newCampground = new Campground(req.body.campground);
  console.log(newCampground);
  newCampground.author = req.user._id;
  await newCampground.save(); 
  req.flash('success', 'Successfully made a new campground!');
  return res.redirect(`/campgrounds/${newCampground._id}`);
}))

// to show page of a specific campground ID
router.get('/:id', catchAsync(async (req, res, next) => {
  // const { id } = req.params;
  // if (!ObjectID.isValid(id)
  //   return next( new ExpressError('Incorrect ID', 400));
  // } <--- don't need this after having CATCHASYNC
  const campground = await Campground.findById(req.params.id).populate({
      path: 'reviews',
      populate: {
        path: 'author'
      }
    }).populate('author');
  console.log(campground)
  if(!campground) {
    req.flash('error', 'Campground not found');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/show', { campground });
}));

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash('error', 'Cannot find that campground!');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/edit', {campground});
}))

// to edit/update campground info
router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  req.flash('success', 'Successfully updated campground!');
  res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted campground');
  res.redirect('/campgrounds');
}))

module.exports = router;
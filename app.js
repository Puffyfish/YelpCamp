const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override'); //to be able to use app.put
const Campground = require('./models/campground');
const Joi = require('joi');

// variables that deal with errors
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const ObjectID = require('mongoose').Types.ObjectId;
const {campgroundSchema} = require('./errorSchema.js');
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

// to setup tool for layouts
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');

// to setup the path
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method')); //to be able to use app.put

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

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/campgrounds', async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', {campgrounds});
});

// route to adding new campground
app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
})

// route after adding a new campground (it goes to /campgrounds)
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => { //catchAsync is a class Error used instead of using the usual try and catch
  const campground = new Campground(req.body.campground);
  //default, res.body is empty bc it has not been parsed so must add app.use(express.urlencoded({extended: true}));
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
})
);

// to show page of a specific campground ID
app.get('/campgrounds/:id', catchAsync(async (req, res, next) => {
  const { id } = req.params.id;
  if (!ObjectID.isValid(id)) {
    return next( new ExpressError('Incorrect ID', 400));
  }
  const campground = await Campground.findById(id);
  if(!campground) {
    return next( new ExpressError('Campground not found', 404));
  }
  res.render('campgrounds/show', { campground });
}));

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id)
  res.render('campgrounds/edit', {campground});
}))

// to edit/update campground info
app.put('/campgrounds/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect('/campgrounds');
}))

// app.all is for ALL requests made
app.all('*', (req, res, next) => { // * means for any kind of path
  next(new ExpressError('Page Not Found'), 404)
})

app.use((err, req, res, next) => {
  const { statusCode = 500} = err; // 500 and 'something went wrong' is just the default
  if(!err.message) err.message = 'Oh no, Something went wrong!'
  res.status(statusCode).render('error', {err});
})

app.listen(3030, () => {
  console.log('Serving port 3030')
});

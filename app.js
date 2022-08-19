const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override'); //to be able to use app.put
const session = require('express-session'); // needed for flash to work; stores data to local memory
const flash = require('connect-flash'); //
const Joi = require('joi');

const Campground = require('./models/campground');

// variables that deal with errors
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const ObjectID = require('mongoose').Types.ObjectId;
const {campgroundSchema} = require('./errorSchema.js');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
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
app.use(express.static, path.join(__dirname, 'public'));

const sessionConfig = {
  secret: 'hushhush',
  resave: false, // set for deprecation warnings to go away
  saveUninitialized: true, // set for deprecation warnings to go away
  cookie: {
    httpOnly: true,
    //cookie expires in 7 days
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}

app.use(session(sessionConfig));
app.use(flash());

// must be before the route handlers so it will run on every single request page
// middleware for flash
app.use( (req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

app.use('campgrounds', campgrounds);
app.use('campgrounds/:id/reviews', reviews);

app.get('/', (req, res) => {
  res.render('home');
});

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

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override'); //to be able to use app.put
const session = require('express-session'); // needed for flash to work; stores data to local memory
const flash = require('connect-flash'); //

const ExpressError = require('./utils/ExpressError');

const reviewRoutes = require('./routes/reviews');
const campgroundRoutes = require('./routes/campgrounds');
const userRoutes = require('./routes/user');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

// mongoose.connect('mongodb://localhost:27017/yelp-camp', {
//   useNewUrlParser: true,
//   useCreateIndex: true,
//   useUnifiedTopology: true,
//   useFindAndModify: false
// });

mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1/yelp-camp')

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

// to setup tool for layouts
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method')); //to be able to use app.put
app.use(express.static(path.join(__dirname, 'public')));

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

app.use(passport.initialize()); // to initialize passport
app.use(passport.session()); // for persistent login sessions
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());// how to store a user in session
passport.deserializeUser(User.deserializeUser());

// must be before the route handlers so it will run on every single request page
// middleware for flash
app.use( (req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

app.use('', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

// -------------- show pages ------------------------
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

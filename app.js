const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override'); //to be able to use app.put
const Campground = require('./models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method')); //to be able to use app.put

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
app.post('/campgrounds', async (req, res) => {
  const campground = new Campground(req.body.campground);
  //default, res.body is empty bc it has not been parsed so must add app.use(express.urlencoded({extended: true}));
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
})

// to show page of a specific campground ID
app.get('/campgrounds/:id', async (req, res) => {
  const campground = await Campground.findById(req.params.id)
  res.render('campgrounds/show', { campground });
});

app.get('/campgrounds/:id/edit', async (req, res) => {
  const campground = await Campground.findById(req.params.id)
  res.render('campgrounds/edit', {campground});
})

// to edit/update campground info
app.put('/campgrounds/:id', async (req, res) => {
  res.send("It worked!");
})

app.listen(3030, () => {
  console.log('Serving port 3030')
});

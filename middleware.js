const { campgroundSchema, reviewSchema } = require('./errorSchema.js');
const ExpressError = require('./utils/ExpressError');

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) { // isAuthenticated is a method in PASSPORT
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login')
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  console.log('validateCampground:', error);
  if (error) {
      const msg = error.details.map(el => el.message).join(',');
      console.log("validateCampground: " + msg);
      throw new ExpressError(msg, 400)
  } else {
      next();
  }
}

module.exports.validateReview = (req, res, next) => {
  const {error} = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el=>el.message).join(',') // map to make a single string
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
  console.log("validateSchema middleware: " + msg);
}
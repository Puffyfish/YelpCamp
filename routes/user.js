const express = require("express");
const router = express.Router({mergeParams:true}); // dont need to merge params bc it has access to its own params
const passport = require("passport");
const User = require("../models/user");

// variables that deal with errors
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

router.get("/register", (req, res) => {
  res.render("users/register");
});

router.get("/login", (req, res) => {
  res.render("users/login");
});

// after registering, should direct to login page
router.post("/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const newUser = new User({ username, email });
      const registeredUser = await User.register(newUser, password);
      // to automatically login the newly registered user
      req.login(registeredUser, err => {
        if(err) return next (err);
        req.flash("success", `Welcome to Yelp Camp ${username}!`);
        res.redirect('/campgrounds');
      })

    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/register");
    }
  }
)

router.post('/login', passport.authenticate('local', 
    { failureFlash: true, failureRedirect: '/login'}), (req, res) => {
            console.log('Successfully logged in')
            req.flash('success', 'Welcome back!');
            res.redirect('/campgrounds')
})

router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if(err) return next(err);
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
})

module.exports = router;

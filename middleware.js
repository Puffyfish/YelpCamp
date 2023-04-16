module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) { // isAuthenticated is a method in PASSPORT
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login')
    }
    next();
}
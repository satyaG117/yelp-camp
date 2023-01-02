const express = require('express');
const passport = require('passport');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const user = require('../controllers/user');

router.route('/register')
    .get(user.renderRegisterForm)
    .post(catchAsync(user.registerUser))

router.route('/login')
    .get(user.renderLoginForm)
    .post(passport.authenticate('local', {
        failureFlash: true, failureRedirect: '/login', failureMessage: true, keepSessionInfo: true // to keep session persistent
    }), user.loginUser)


router.get('/logout', user.logoutUser)

module.exports = router;
const express = require('express');
const router = express.Router({mergeParams : true});
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn,validateReview,isReviewAuthor} = require('../middleware');
const review = require('../controllers/review');


//reviews routes

router.post('/',isLoggedIn,validateReview,catchAsync(review.createReview))

router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(review.deleteReview))

module.exports = router;
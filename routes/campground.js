const express = require('express');
const catchAsync = require('../utils/catchAsync');
const campground = require('../controllers/campground');
const router = express.Router();
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer  = require('multer')
const {storage} = require('../cloudinary');
const upload = multer({ storage })

router.get('/new', isLoggedIn, campground.renderNewForm)

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campground.renderEditForm));

router.route('/')
    .get(catchAsync(campground.index))
    .post(isLoggedIn, upload.array('image'),validateCampground, catchAsync(campground.createCampground));


router.route('/:id')
    .get(catchAsync(campground.show))
    .put(isLoggedIn, isAuthor, upload.array('image') ,validateCampground, catchAsync(campground.editCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campground.deleteCampground));


module.exports = router;
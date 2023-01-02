const Campground = require('./models/campground');
const {campgroundSchema,reviewSchema} = require('./utils/schemas');
const ExpressError = require('./utils/ExpressError');
const Review = require('./models/review');


// checks if user is logged in 
module.exports.isLoggedIn = (req,res,next)=>{
    req.session.returnTo = req.originalUrl;
    if(!req.isAuthenticated()){
        req.flash('error','You must be logged in');
        return res.redirect('/login');
    }
    next();
}

module.exports.isAuthor = async(req,res,next)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(req.user && campground.author.equals(req.user._id)){
        next();
    }
    else{
        req.flash('error',"You dont't have permission to do that");
        res.redirect(`/campgrounds/${id}`);
    }

}

//middleware to validate form inputs
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    }
    else {
        next();
    }
}

//middleware to validate form inputs
module.exports.validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    }else {
        next();
    }
}


module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

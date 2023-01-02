const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const {cloudinary} = require('../cloudinary');


const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken : mapBoxToken});


module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({});
    if (!campgrounds) {
        console.log('Campground not found')
        req.flash('error', 'Campground not found');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/index.ejs', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new.ejs');
}

module.exports.show = async (req, res, next) => {
    const { id } = req.params;

    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author',
        }
    }).populate('author', ['username']);

    if (!campground) {
        console.log('Campground not found')
        req.flash('error', 'Campground not found');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show.ejs', { campground });
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query : req.body.campground.location,
        limit : 1
    }).send()

    console.log(geoData.body.features);
    // res.send(geoData.body.features[0].geometry);

    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.author = req.user._id;
    //store image filenames and urls in DB as an array
    campground.images = req.files.map((f) => {
        return {
            url: f.path,
            filename: f.filename
        }
    })
    
    await campground.save();
    console.log(campground);

    req.flash('success', 'Campground added successfully');
    res.redirect(`/campgrounds/${campground._id}`);

}

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if (!campground) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/edit.ejs', { campground });

}

module.exports.editCampground = async (req, res) => {
    const { id } = req.params;

    const geoData = await geocoder.forwardGeocode({
        query : req.body.campground.location,
        limit : 1
    }).send()

    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    // console.log(campground)
    campground.geometry = geoData.body.features[0].geometry;
    await campground.save();
    // if user has selected to delete any image(s) delete if from cloudinary and remove it from images array
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    
    for(let image of campground.images){
        await cloudinary.uploader.destroy(image.filename);
    }

    req.flash('success', 'Campground deleted successfully');
    res.redirect('/campgrounds');
}
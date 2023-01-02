const mongoose = require('mongoose');
const Review = require('./review');
// const { campgroundSchema } = require('../utils/schemas');

const { Schema } = mongoose;

const opts = {toJSON : { virtuals : true } }


const imageSchema = new Schema({
    url: String,
    filename: String
})

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})

const campgroundSchema = new Schema({
    title: String,
    images: [imageSchema],
    geometry: {
        type: {
            type: String,   
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
} , opts );

campgroundSchema.virtual('properties.popupMarkup').get(function(){
    return `<h6><a href="/campgrounds/${this._id}">${this.title}</a></h6><p class="text-muted">${this.location}</p>`;
})

//if campground is deleted then delete all reviews
campgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: { $in: doc.reviews }
        })
    }
})

module.exports = mongoose.model('Campground', campgroundSchema);


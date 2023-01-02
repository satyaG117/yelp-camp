if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');

const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const campgroundRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/review');
const userRoutes = require('./routes/user');

const session = require('express-session');
const flash = require('connect-flash');

const passport = require('passport');
const LocalStrategy = require('passport-local');

const User = require('./models/user');

const app = express();
const port = 8080;

//connect to mongodb
main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://localhost:27017/yelp-camp');
}

// to render ejs file from views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

//set ejs engine to ejs-mate
app.engine('ejs', ejsMate);

//serve static filesn from public directory
app.use(express.static(path.join(__dirname, '/public')));

app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

//override method to use put/patch/delete requests
app.use(methodOverride('_method'));

//remove $ and . from req.body , req.params , req.query etc
app.use(
    mongoSanitize({
        replaceWith: '_',
    }),
);



const sessionConfig = {
    name: 'session',
    secret: 'secretstring',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 86400000,
        maxAge: 86400000
    }
}
app.use(session(sessionConfig))

app.use(flash());

//using passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

//set and un-set user from session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    //used to show or hide login and logout button
    res.locals.currentUser = req.user;
    //setting flash messages on response
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dv5vm4sqh/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dv5vm4sqh/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/dv5vm4sqh/"
];
const fontSrcUrls = [ "https://res.cloudinary.com/dv5vm4sqh/" ];
 
app.use(
    helmet.contentSecurityPolicy({
        directives : {
            defaultSrc : [],
            connectSrc : [ "'self'", ...connectSrcUrls ],
            scriptSrc  : [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
            styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
            workerSrc  : [ "'self'", "blob:" ],
            objectSrc  : [],
            imgSrc     : [
                "'self'",
                "blob:",
                "data:",
                `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/"
            ],
            fontSrc    : [ "'self'", ...fontSrcUrls ],
            mediaSrc   : [ `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/` ],
            childSrc   : [ "blob:" ]
        }
    })
);



//routes
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.get('/', (req, res) => {
    res.render('home.ejs');
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
})

// error handler
app.use((err, req, res, next) => {
    // const {statusCode=500 , message='Something went wrong'} = err;
    // res.status(statusCode).send(`[ERROR ${statusCode} ] ${message}`);
    if (!err.message)
        err.message = 'Something went wrong';
    res.render('error', { err });
})

app.listen(port, () => {
    console.log("Listening on port : ", port);
})

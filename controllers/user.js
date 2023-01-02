const User = require('../models/user');

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register');
};

module.exports.registerUser = async (req, res) => {
    try {

        const { username, email, password } = req.body;
        const user = new User({ username, email });
        //takes the passsword hashes it and saves all the fields to the db
        //also checks that users with same username aren't registered
        const registeredUser = await User.register(user, password);

        //logs in the newly registered user
        req.login(registeredUser, (err) => {
            if (err) return next(err);

            req.flash('success', 'Welcome to yelpcamp');
            res.redirect('/campgrounds');

        });

    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/register');
    }

}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
}

module.exports.loginUser = (req, res) => {
    req.flash('success', 'Welcome back');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;

    res.redirect(redirectUrl);
}

module.exports.logoutUser = async (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const { errorMsg, successMsg } = require('../utils/messages');
const {
  ensureAuthenticated,
  ensureNotAuthenticated,
} = require('../utils/ensureAuthenticated');

const homePage = 'pages/index.html';
const registerPage = 'auth/register.html';
const loginPage = 'auth/login.html';

const userModel = mongoose.model('user');
const cityModel = mongoose.model('city');
const countryModel = mongoose.model('country');
const subcountryModel = mongoose.model('subcountry');

const router = express.Router();
/* /login */
router.get('/login', ensureNotAuthenticated, csrfProtection, (req, res) => {
  return res.render(loginPage, { csrfToken: req.csrfToken() });
});

router.post(
  '/login',
  ensureNotAuthenticated,
  csrfProtection,
  (req, res, next) => {
    const { username, password } = req.body;

    if (username && password) {
      passport.authenticate('local', (error, user) => {
        if (error) {
          return res.render(loginPage, errorMsg('Internal server error.'));
        }

        req.logIn(user, (error) => {
          if (error) {
            return res.render(loginPage, errorMsg('Invalid credentials.'));
          }
          return res.redirect('/images');
        });
      })(req, res, next);
    } else {
      return res.render(
        loginPage,
        errorMsg('Username or password not provided.')
      );
    }
  }
);

/* /register */
router.get(
  '/register',
  ensureNotAuthenticated,
  csrfProtection,
  async (req, res) => {
    const countries = await countryModel.find();
    const subcountries = await subcountryModel.find();
    const cities = await cityModel.find();

    return res.render(registerPage, {
      csrfToken: req.csrfToken(),
      countries,
      subcountries,
      cities,
    });
  }
);

router.post('/register', ensureNotAuthenticated, csrfProtection, (req, res) => {
  const {
    country,
    subcountry,
    city,
    password2,
    _csrf,
    firstName,
    lastName,
    ...formData
  } = req.body;
  if (
    formData.email &&
    formData.username &&
    formData.password &&
    formData.password !== formData.password2
  ) {
    userModel.findOne(
      { $or: [{ email: formData.email }, { username: formData.username }] },
      (error, user) => {
        if (user || error) {
          return res.render(
            registerPage,
            errorMsg('Email or username alread taken.')
          );
        }
        const newUser = new userModel({
          ...formData,
          location: {
            country,
            subcountry,
            city,
          },
          name: {
            firstName,
            lastName,
          },
        });

        newUser.save((error) => {
          if (error) {
            console.log(error);
            return res.render(registerPage, errorMsg(error._message));
          }
          return res.render(
            loginPage,
            successMsg('Succesfully register, now you can log in')
          );
        });
      }
    );
  } else {
    return res.render(
      registerPage,
      errorMsg(
        'Missing fields or password and password confirmation do not match.'
      )
    );
  }
});

/* /logout */
router.post('/logout', ensureAuthenticated, (req, res) => {
  req.logout();
  return res.render(loginPage, successMsg('Succesfully logged out.'));
});

module.exports = router;

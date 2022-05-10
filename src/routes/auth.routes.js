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

const templates = {
  home: 'pages/index.html',
  register: 'auth/register.html',
  login: 'auth/login.html',
};

const models = {
  user: mongoose.model('user'),
  city: mongoose.model('city'),
  country: mongoose.model('country'),
  subcountry: mongoose.model('subcountry'),
};

const router = express.Router();
/* /login */
router.get('/login', ensureNotAuthenticated, csrfProtection, (req, res) => {
  return res.render(templates.login, { csrfToken: req.csrfToken() });
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
          return res.render(
            templates.login,
            errorMsg('Internal server error.')
          );
        }

        req.logIn(user, (error) => {
          if (error) {
            return res.render(
              templates.login,
              errorMsg('Invalid credentials.')
            );
          }
          return res.redirect('/images');
        });
      })(req, res, next);
    } else {
      return res.render(
        templates.login,
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
    return res.render(templates.register, {
      csrfToken: req.csrfToken(),
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
    models.user.findOne(
      { $or: [{ email: formData.email }, { username: formData.username }] },
      (error, user) => {
        if (user || error) {
          return res.render(
            templates.register,
            errorMsg('Email or username alread taken.')
          );
        }
        const newUser = new models.user({
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
            return res.render(templates.register, errorMsg(error._message));
          }
          return res.render(
            templates.login,
            successMsg('Succesfully register, now you can log in')
          );
        });
      }
    );
  } else {
    return res.render(
      templates.register,
      errorMsg(
        'Missing fields or password and password confirmation do not match.'
      )
    );
  }
});

/* /logout */
router.post('/logout', ensureAuthenticated, (req, res) => {
  req.logout();
  return res.render(templates.login, successMsg('Succesfully logged out.'));
});

module.exports = router;

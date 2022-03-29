const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const { errorMsg, successMsg } = require('../utils/messages');
const { ensureAuthenticated } = require('../utils/ensureAuthenticated');

const templates = {
  upload: 'imagesapp/upload_image.html',
  home: 'pages/index.html',
};

const models = {
  city: mongoose.model('city'),
  image: mongoose.model('image'),
  country: mongoose.model('country'),
  subcountry: mongoose.model('subcountry'),
};

const router = express.Router();

/* home */
router.get('/', async (req, res) => {
  const images = await models.image.find();
  console.log(images);
  return res.render(templates.home, { images });
});

/* Upload Image */
router.get(
  '/upload_image',
  ensureAuthenticated,
  csrfProtection,
  async (req, res) => {
    const cities = await models.city.find();
    return res.render(templates.upload, { csrfToken: req.csrfToken(), cities });
  }
);

router.post(
  '/upload_image',
  ensureAuthenticated,
  csrfProtection,
  async (req, res) => {
    const { title, description, category, city, photoUrl } = req.body;
    if (title && description && category && city) {
      const cityObject = JSON.parse(city);

      const countryAndSubcountry = (
        await Promise.all([
          models.country.findById(cityObject.countryId),
          models.subcountry.findById(cityObject.subcountryId),
        ])
      ).map((e) => ({ id: e.id, name: e.name }));

      const newImage = new models.image({
        title,
        description,
        photoUrl,
        category: {
          id: '1',
          name: 'Nature',
        },
        location: {
          country: countryAndSubcountry[0],
          subcountry: countryAndSubcountry[1],
          city: {
            id: cityObject.id,
            name: cityObject.name,
          },
        },
        user: {
          id: req.user._id,
          username: req.user.username,
        },
        photoUrl: '/img/building.jpg',
      });

      newImage.save((error) => {
        if (error) {
          console.log(error);
          return res.render(templates.upload, errorMsg(error._message));
        }
        return res.render(
          templates.upload,
          successMsg('Image upload was succesfull.')
        );
      });
    } else {
      return res.render(templates.upload, errorMsg('All fields required.'));
    }
  }
);

module.exports = router;

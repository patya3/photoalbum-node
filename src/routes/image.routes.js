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
  image: 'imagesapp/image.html'
};

const models = {
  city: mongoose.model('city'),
  image: mongoose.model('image'),
  country: mongoose.model('country'),
  subcountry: mongoose.model('subcountry'),
  category: mongoose.model('category')
};

const router = express.Router();

/* home */
router.get('/', async (req, res) => {
  const images = await models.image.find().select(['title', 'photoUrl', '_id', 'description']);
  console.log(images);
  return res.render(templates.home, { images });
});

router.get('/image/:id', async (req, res) => {
  const id = req.params.id;
  const image = await models.image.findById(id);
  return res.render(templates.image, {image})
})

/* Upload Image */
router.get(
  '/upload_image',
  ensureAuthenticated,
  csrfProtection,
  async (req, res) => {
    const cities = await models.city.find().select(['name', '_id', 'subcountryId', 'countryId']);
    const categories = await models.category.find();
    return res.render(templates.upload, { csrfToken: req.csrfToken(), cities, categories });
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
          models.country.findOne({ _id: cityObject.countryId }),
          models.subcountry.findOne({ _id: cityObject.subcountryId }),
        ])
      )
        .filter((e) => e && e._id)
        .map((e) => {
          return { id: e._id, name: e.name };
        });

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

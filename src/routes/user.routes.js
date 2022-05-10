const express = require('express');
const mongoose = require('mongoose');
const { ensureAuthenticated } = require('../utils/ensureAuthenticated');
const csrf = require('csurf');
const { successMsg, errorMsg } = require('../utils/messages');
const csrfProtection = csrf({ cookie: true });

const templates = {
  leaderboard: 'user/leaderboard.html',
  my_images: 'user/my_images.html',
  profile: 'user/profile.html',
};

const models = {
  image: mongoose.model('image'),
  user: mongoose.model('user'),
  country: mongoose.model('country'),
  subcountry: mongoose.model('subcountry'),
  city: mongoose.model('city'),
  category: mongoose.model('category'),
};

const router = express.Router();

router.get('/leaderboard', async (req, res) => {
  const limit = 10;

  let users = await models.image
    .aggregate([
      {
        $group: {
          _id: '$user.id',
          user: { $first: '$user' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ])
    .limit(limit);

  const numberOfUsers = (
    await models.image.aggregate([
      {
        $group: {
          _id: '$user.id',
          user: { $first: '$user' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $count: 'totalCount' },
    ])
  )[0].totalCount;
  const maxPage = Math.ceil(numberOfUsers / limit);

  // search
  if (req.query.username) {
    users = users.filter((user) =>
      user.user.username.includes(req.query.username)
    );
  }

  return res.render(templates.leaderboard, { users, maxPage });
});

router.get('/profile/:id', async (req, res) => {
  const user = await models.user.findById(req.params.id);

  const images = await models.image.find({
    'user.id': req.params.id,
  });

  const numberOfImages = await models.image
    .where({ 'user.id': req.params.id })
    .count();

  return res.render(templates.profile, {
    images,
    user,
    numberOfImages,
  });
});

router.get(
  '/my_images',
  ensureAuthenticated,
  csrfProtection,
  async (req, res) => {
    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    const limit = 10;

    const images = await models.image
      .find({ 'user.id': req.user._id })
      .sort({ createdAt: -1 })
      .skip(limit * (page - 1))
      .limit(limit);
    const numberOfImages = await models.image.countDocuments({
      'user.id': req.user._id,
    });
    const categories = await models.category.find();

    const maxPage = Math.ceil(numberOfImages / limit);

    let message = {};

    if (req.query.success !== undefined) {
      if (req.query.success === 'true') {
        message = successMsg('Image modified.');
      } else {
        message = errorMsg(req.query.message);
      }
    }

    return res.render(templates.my_images, {
      csrfToken: req.csrfToken(),
      images,
      categories,
      maxPage,
      ...message,
    });
  }
);

module.exports = router;

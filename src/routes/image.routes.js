const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const { errorMsg, successMsg } = require('../utils/messages');
const { ensureAuthenticated } = require('../utils/ensureAuthenticated');
const Multer = require('multer');
const { createPhotoUrl, putObject, deleteObject } = require('../utils/minio');
const { ObjectId } = require('mongodb');

const templates = {
  upload: 'imagesapp/upload_image.html',
  home: 'pages/index.html',
  image: 'imagesapp/image.html',
  browseImages: 'imagesapp/browse_images.html',
  my_images: 'user/my_images.html',
  faces_of_cities: 'imagesapp/cities_faces.html',
  popular_destinations: 'imagesapp/popular_destinations.html',
};

const models = {
  city: mongoose.model('city'),
  image: mongoose.model('image'),
  country: mongoose.model('country'),
  subcountry: mongoose.model('subcountry'),
  category: mongoose.model('category'),
  rating: mongoose.model('rating'),
};

const router = express.Router();

/* home */
router.get('/', async (req, res) => {
  const images = await models.image
    .find()
    .select(['title', 'photoUrl', '_id', 'description'])
    .sort({ createdAt: -1 })
    .limit(6);

  const daily = await models.image.count({
    createdAt: {
      $gte: new Date().setHours(0, 0, 0, 0),
      $lt: new Date().setHours(23, 59, 59, 999),
    },
  });

  const monthly = await models.image.count({
    $expr: {
      $eq: [{ $month: '$createdAt' }, new Date().getMonth() + 1],
    },
  });

  const yearly = await models.image.count({
    $expr: {
      $eq: [{ $year: '$createdAt' }, new Date().getFullYear()],
    },
  });

  const allTime = await models.image.count();

  const mostLovedCity = (
    await models.image.aggregate([
      { $sortByCount: '$location.city.id' },
      { $limit: 1 },
    ])
  )[0];

  let firstCityName = '';
  if (mostLovedCity) {
    firstCityName = (
      await models.city.findById(mostLovedCity._id).select(['name'])
    ).name;
  }

  return res.render(templates.home, {
    images,
    statistics: {
      daily,
      monthly,
      yearly,
      allTime,
      firstCity: {
        name: firstCityName,
        ...mostLovedCity,
      },
    },
  });
});

router.get('/browse_images', async (req, res) => {
  const q = req.query;
  let page = 1;
  if (q.page) {
    page = q.page;
  }
  const limit = 10;

  const categoriesRaw = await models.category
    .find()
    .sort({ parentId: 1, _id: 1 });

  const categoryFilter = categoriesRaw
    .filter((c) => c.parentId == q.category || c._id == q.category)
    .map((c) => c._id);

  const dbQuery = {
    ...(q.date_from && { createdAt: { $gte: new Date(q.date_from) } }),
    ...(q.date_to && { createdAt: { $lt: new Date(q.date_to) } }),
    ...(q.country && { 'location.country.id': q.country }),
    ...(q.subcountry && { 'location.subcountry.id': q.subcountry }),
    ...(q.city && { 'location.city.id': q.city }),
    ...(q.keywords && { title: { $regex: new RegExp(q.keywords, 'i') } }),
    ...(q.category &&
      q.category != '0' && { 'category.id': { $in: categoryFilter } }),
  };

  /* TODO annotate with rating */
  const images = await models.image
    .find(dbQuery)
    .select(['_id', 'title', 'photoUrl', 'location.city'])
    .sort({ createdAt: -1 })
    .skip(limit * (page - 1))
    .limit(limit);

  const numberOfImages = await models.image.countDocuments(dbQuery);
  const maxPage = Math.ceil(numberOfImages / limit);

  const imageCountsByCategory = await models.image.aggregate([
    {
      $group: {
        _id: '$category.id',
        count: { $sum: 1 },
      },
    },
  ]);

  const categories = [];

  for (const category of categoriesRaw) {
    let cat = { ...category._doc };
    const imageCount = imageCountsByCategory.find(
      (item) => item._id == cat._id
    );
    cat.imageCount = imageCount ? imageCount.count : 0;
    if (!cat.parentId) {
      categories.push({ ...cat, subcategories: [] });
    } else {
      const index = categories.findIndex((c) => c._id == cat.parentId);
      categories[index].subcategories.push(cat);
      categories[index].imageCount += cat.imageCount;
    }
  }
  return res.render(templates.browseImages, {
    images,
    categories,
    categoriesRaw,
    values: q,
    maxPage,
    numberOfImages,
  });
});

router.get('/faces_of_cities', async (req, res) => {
  const selectedCityId = req.query.city;
  const imageIdsAndAvgRatings = await models.rating.aggregate([
    {
      $group: {
        _id: '$imageId',
        avgRating: { $avg: '$stars' },
      },
    },
    { $sort: { avgRating: -1 } },
  ]);

  let images;
  if (selectedCityId) {
    images = await models.image
      .find({ 'location.city.id': selectedCityId })
      .limit(10);
  } else {
    images = await models.image.find({
      _id: { $in: imageIdsAndAvgRatings.map((item) => item._id) },
    });
  }

  const facesOfCities = {};

  for (const image of images) {
    const key = image.location.city.id;
    if (!facesOfCities[key]) {
      facesOfCities[key] = [image];
    } else {
      facesOfCities[key].push(image);
    }
  }

  return res.render(templates.faces_of_cities, { facesOfCities });
});

router.get('/popular_destinations', async (req, res) => {
  const popularDestinations = await models.image
    .aggregate([
      {
        $group: {
          _id: '$location.city.id',
          count: { $sum: 1 },
          photoUrl: { $last: '$photoUrl' },
          name: { $last: '$location.city.name' },
        },
      },
      { $sort: { count: -1 } },
    ])
    .limit(10);

  return res.render(templates.popular_destinations, { popularDestinations });
});

router.get('/image/:id', csrfProtection, async (req, res) => {
  const id = req.params.id;
  const image = await models.image.findById(id);

  const ratings = await models.rating
    .find({ imageId: id })
    .sort({ createdAt: -1 });

  let message = {};

  if (req.query.success !== undefined) {
    if (req.query.success === 'true') {
      message = successMsg('Successfully commented.');
    } else {
      message = errorMsg(req.query.message);
    }
  }

  return res.render(templates.image, {
    csrfToken: req.csrfToken(),
    image,
    ratings,
    ...message,
  });
});

router.delete('/image/:id', ensureAuthenticated, async (req, res) => {
  const id = req.params.id;
  const image = await models.image.findById(id);
  if (req.user._id != image.user.id) {
    return res.render(
      templates.my_images,
      errorMsg('Cant delete others images.')
    );
  }

  const response = await models.image.deleteOne({ _id: ObjectId(id) });
  if (!response.deletedCount) {
    return res.render(templates.my_images, errorMsg('Something went wrong.'));
  }
  await models.rating.deleteMany({ imageId: id });
  await deleteObject(image.photoUrl.split('/').slice().pop());
  return res.render(templates.my_images, successMsg('Successfully deleted.'));
});

router.post(
  '/rate_image/:id',
  ensureAuthenticated,
  csrfProtection,
  async (req, res) => {
    const imageId = req.params.id;
    const user = {
      id: req.user._id,
      username: req.user.username,
    };

    req.message = 'asd';

    const { comment, stars } = req.body;

    if (comment && stars && user && imageId) {
      const newRating = new models.rating({
        stars,
        comment,
        user,
        imageId,
      });

      newRating.save((error) => {
        if (error) {
          return res.redirect(
            `/images/image/${imageId}?success=false&message=${error._message}`
          );
        }
        return res.redirect(`/images/image/${imageId}?success=true`);
      });
    } else {
      return res.redirect(
        `/images/image/${imageId}?success=false&message=${'All fields required.'}`
      );
    }
  }
);

router.post(
  '/reply/:commentId',
  ensureAuthenticated,
  csrfProtection,
  async (req, res) => {
    const commentId = req.params.commentId;
    const user = {
      id: req.user._id,
      username: req.user.username,
    };

    if (req.body.comment && user) {
      models.rating.findByIdAndUpdate(
        commentId,
        {
          $push: {
            replies: {
              user,
              comment: req.body.comment,
            },
          },
        },
        (error, doc) => {
          if (error) {
            return res.redirect(
              `/images/image/${imageId}?success=false&message=${error._message}`
            );
          }
          return res.redirect(`/images/image/${doc.imageId}?success=true`);
        }
      );
    } else {
      return res.redirect(
        `/images/image/${imageId}?success=false&message=${'All fields required.'}`
      );
    }
  }
);

/* Upload Image */
router.get(
  '/upload_image',
  ensureAuthenticated,
  csrfProtection,
  async (req, res) => {
    const categories = await models.category.find();
    return res.render(templates.upload, {
      csrfToken: req.csrfToken(),
      categories,
    });
  }
);

router.post(
  '/upload_image',
  Multer({ storage: Multer.memoryStorage() }).single('photo'),
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

      const { photoUrl, filename } = await putObject(
        req.file.originalname,
        req.file.buffer
      );

      const newImage = new models.image({
        title,
        description,
        photoUrl,
        category: JSON.parse(category),
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
        photoUrl,
      });

      newImage.save(async (error) => {
        if (error) {
          deleteObject(filename);

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

router.post(
  '/update_image/:id',
  ensureAuthenticated,
  csrfProtection,
  async (req, res) => {
    const id = req.params.id;

    let { title, description, category, country, subcountry, city } = req.body;

    category = JSON.parse(category);
    subcountry = JSON.parse(subcountry);
    country = JSON.parse(country);
    city = JSON.parse(city);

    if (title && description && country && subcountry && city && category) {
      models.image.findByIdAndUpdate(
        id,
        {
          title,
          description,
          category,
          location: { city, country, subcountry },
        },
        (error, doc) => {
          if (error) {
            return res.redirect(
              `/users/my_images?success=false&message=${error._message}`
            );
          }
          return res.redirect(`/users/my_images?success=true`);
        }
      );
    } else {
      return res.redirect(
        `/users/my_images?success=false&message=${'All fields required.'}`
      );
    }
  }
);

module.exports = router;

const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const models = {
  city: mongoose.model('city'),
  country: mongoose.model('country'),
  subcountry: mongoose.model('subcountry'),
};

router.get('/cities', async (req, res) => {
  const regexp = new RegExp(req.query.name, 'i');
  const cities = await models.city.find({ name: { $regex: regexp } }).limit(10);
  return res.send(cities);
});

router.get('/countries', async (req, res) => {
  const regexp = new RegExp(req.query.name, 'i');
  const countries = await models.country
    .find({ name: { $regex: regexp } })
    .limit(10);
  return res.send(countries);
});

router.get('/subcountries', async (req, res) => {
  const regexp = new RegExp(req.query.name, 'i');
  const subcountries = await models.subcountry
    .find({ name: { $regex: regexp } })
    .limit(10);
  return res.send(subcountries);
});

module.exports = router;

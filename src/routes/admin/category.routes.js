const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/asd', async (req, res) => {
  return res.send('hello szia');
});

module.exports = router;

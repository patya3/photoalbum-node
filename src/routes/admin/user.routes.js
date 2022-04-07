const express = require('express'); /* 
const mongoose = require('mongoose');
const passport = require('passport');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const { errorMsg, successMsg } = require('../utils/messages');*/

const router = express.Router();

router.get('/', (req, res) => {
  return res.send('Hello szoa');
});

module.exports = router;

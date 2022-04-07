const express = require('express');
const { ensureAdmin } = require('../utils/ensureAuthenticated');

const router = express.Router();

router.use('/users', require('./admin/user.routes'));

module.exports = router;

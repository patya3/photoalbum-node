const express = require('express');
const { ensureAdmin } = require('../utils/ensureAuthenticated');

const router = express.Router();

router.use('/users', require('./admin/user.routes'));
router.use('/categories', require('./admin/category.routes'));

module.exports = router;

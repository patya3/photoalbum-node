const express = require('express');
const mongoose = require('mongoose');
/* const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const { errorMsg, successMsg } = require('../utils/messages'); */

const router = express.Router();

const templates = {
  list: 'admin/users/list.html',
  user: 'admin/users/user.html',
};

const models = {
  user: mongoose.model('user'),
};

router.get('/', async (req, res) => {
  const users = await models.user.find();

  return res.render(templates.list, { users });
});

router.get('/:id', async (req, res) => {
  const user = await models.user.findById(req.params.id);

  return res.render(templates.user, { user });
});

module.exports = router;

/*Helloo Patrik Hello*/


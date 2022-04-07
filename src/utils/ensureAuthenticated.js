function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.redirect('/auth/login');
}

function ensureNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) return next();
  return res.redirect('/images/upload_image');
}

function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.isSuperuser) return next();
  return res.redirect('/images');
}

module.exports = { ensureAuthenticated, ensureNotAuthenticated, ensureAdmin };

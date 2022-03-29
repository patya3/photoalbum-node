function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.redirect('/auth/login');
}

function ensureNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) return next();
  return res.redirect('/images/upload_image');
}

module.exports = { ensureAuthenticated, ensureNotAuthenticated };

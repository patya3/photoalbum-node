module.exports = function (req, res, next) {
  var engine = res.app.get('engine');

  engine.addGlobal('request', req);

  next();
};

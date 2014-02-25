/**
 * Redirect to proper image location.
 */
exports.imageRedirect = function (req, res) {
  var newURL = req.app.get('config').BITESIZE_BLOG_IMAGE_PATH + req.url;
  res.redirect(newURL);
};
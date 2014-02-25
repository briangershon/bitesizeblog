/**
 * Redirect to proper image location.
 */
exports.imageRedirect = function (req, res) {
  var newURL = req.app.get('blog_image_path') + req.url;
  res.redirect(newURL);
};
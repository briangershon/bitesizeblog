/*
 * GET home page.
 */
exports.index = function (req, res) {
  var title = req.app.get('config').BITESIZE_BLOG_TITLE;
  req.app.locals.allPosts().then(function (posts) {
    res.render('index', {title: title, posts: posts, cacheTimestamp: req.app.locals.cacheTimestamp});
  });
};
/*
 * GET home page.
 */
var Promise = require('es6-promise').Promise;

exports.index = function (req, res) {
  Promise.all([req.app.locals.getConfig(), req.app.locals.getPosts()]).then(function (results) {
    var contentConfig = results[0],
      posts = results[1];

    var title = contentConfig.title;
    res.render('index', {title: title, posts: posts.slice(0, 3), cacheTimestamp: req.app.locals.cacheTimestamp});
  }, function fail(err) {
    console.log('INDEX ERROR', err);
  });
};
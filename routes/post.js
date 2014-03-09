/*
 * GET blog post.
 */
var Promise = require('es6-promise').Promise;

exports.index = function (req, res) {
  var postNameToFind = '/' + [req.params.year, req.params.month, req.params.day, req.params.title].join('/') + '/';

  Promise.all([req.app.locals.getConfig(), req.app.locals.getPosts()]).then(function (results) {
    var contentConfig = results[0],
      posts = results[1];

    var title = contentConfig.title;

    var filteredPosts = posts.filter(function (post) {
      return post.route === postNameToFind;
    });

    if (filteredPosts.length === 1) {
      res.render('post', {
        title: title,
        post: filteredPosts[0],
        cacheTimestamp: req.app.locals.cacheTimestamp,
        google_analytics_tracking_id: contentConfig.google_analytics_tracking_id
      });
    } else {
      res.send(404);
    }
  }, function fail(err) {
    console.log('INDEX ERROR', err);
  });
};
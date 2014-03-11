/*
 * GET /archives page.
 */
var Promise = require('es6-promise').Promise;

exports.index = function (req, res) {
  Promise.all([req.app.locals.getConfig(req.app), req.app.locals.getPosts(req.app)]).then(function (results) {
    var contentConfig = results[0],
      posts = results[1];

    res.render('archives', {
      title: contentConfig.title,
      author: contentConfig.author,
      permalinkPrefix: contentConfig.permalink_prefix,
      posts: posts,
      feedURL: contentConfig.subscribe_rss,
      cacheTimestamp: req.app.locals.cacheTimestamp,
      google_analytics_tracking_id: contentConfig.google_analytics_tracking_id,
      homePage: true
    });
  }, function fail(err) {
    console.log('ARCHIVES ERROR', err);
  });
};
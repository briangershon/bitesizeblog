/**
 * Show Atom Feed
 */

var Promise = require('es6-promise').Promise,
  Feed = require('feed');

exports.feed = function (req, res) {
  Promise.all([req.app.locals.getConfig(), req.app.locals.getPosts()]).then(function (results) {
    var contentConfig = results[0],
      posts = results[1];

    var lastUpdated = new Date(posts[0].date);

    var feedResults = new Feed({
      title:       contentConfig.title,
      description: contentConfig.description,
      id:          contentConfig.url + "/",   // match octopress version with trailing /
      link:        contentConfig.url + "/",   // match octopress version with trailing /
      // image:       'http://example.com/image.png',
      copyright:   'All rights reserved 2014, ' + contentConfig.author,
      updated:     lastUpdated,

      author: {
          name:    contentConfig.author,
          // email:   '',
          // link:    'https://example.com/johndoe'
        }
      });

    posts.forEach(function (post) {
      var permalink = contentConfig.url + contentConfig.permalink_prefix + post.route,
        id = permalink.substring(0, permalink.length - 1);  // strip off trailing / to match octopress version

      var item = {
        id:             id,
        title:          post.title,
        link:           permalink,
        // description:    post.description,
        date:           new Date(post.date),
        // image:          post.image
        content: post.body
      };
      feedResults.addItem(item);
    });

    try {
      var feedRender = feedResults.render('atom-1.0');
      res.set('Content-Type', 'text/xml');
      res.send(feedRender);
    }
    catch (err) {
      res.send(500, "Problem generating feed due to " + err.message);
    }

  }, function fail(err) {
    res.send(500, "Promise failed. Problem generating feed due to " + err.message);
  });
};
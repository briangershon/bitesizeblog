/**
 * Show Atom Feed
 */

var Promise = require('es6-promise').Promise,
  Feed = require('feed');

exports.feed = function (req, res) {
  Promise.all([req.app.locals.getConfig(), req.app.locals.getPosts()]).then(function (results) {
    var contentConfig = results[0],
      posts = results[1];

    var feedResults = new Feed({
      title:       contentConfig.title,
      description: 'This is my personnal feed!',
      link:        'http://example.com/',
      image:       'http://example.com/image.png',
      copyright:   'All rights reserved 2013, John Doe',
      updated:     new Date(2013, 06, 14),                // optional, default = today

      author: {
          name:    'John Doe',
          email:   'johndoe@example.com',
          link:    'https://example.com/johndoe'
        }
      });

    res.set('Content-Type', 'text/xml');
    res.send(feedResults.render('atom-1.0'));


  }, function fail(err) {
    console.log('INDEX ERROR', err);
  });
};
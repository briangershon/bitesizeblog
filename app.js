/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var image = require('./routes/image');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

var config = {
  BITESIZE_GITHUB_ACCESS_TOKEN: process.env.BITESIZE_GITHUB_ACCESS_TOKEN,
  BITESIZE_BLOG_TITLE: process.env.BITESIZE_BLOG_TITLE,
  BITESIZE_BLOG_GITHUB_REPO: process.env.BITESIZE_BLOG_GITHUB_REPO,
  BITESIZE_BLOG_GITHUB_POST_PATH: process.env.BITESIZE_BLOG_GITHUB_POST_PATH,
  BITESIZE_BLOG_IMAGE_ROUTE: process.env.BITESIZE_BLOG_IMAGE_ROUTE,
  BITESIZE_BLOG_IMAGE_PATH: process.env.BITESIZE_BLOG_IMAGE_PATH
};
app.set('config', config);

app.get('/', routes.index);
app.get(config.BITESIZE_BLOG_IMAGE_ROUTE, image.imageRedirect);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

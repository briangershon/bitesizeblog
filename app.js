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

app.set('blog_image_route', '/images/post/*');
app.set('blog_image_path', 'https://raw.github.com/briangershon/blog.evolvingbits.com/master');
app.set('blog_title', 'new.blog.evolvingbits.com');

app.get('/', routes.index);
app.get(app.get('blog_image_route'), image.imageRedirect);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

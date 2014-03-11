var path = require('path'),
  retrieve = require('./lib/retrieve');

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var feedRoute = require('./routes/feed');
var postRoute = require('./routes/post');

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

if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

app.locals.getConfig = retrieve.getConfig;
app.locals.getPosts = retrieve.getPosts;

app.get('/', routes.index);
app.get('/atom.xml', feedRoute.feed);

retrieve.getConfig(app).then(function (contentConfig) {
  app.get(contentConfig.permalink, postRoute.index);
});

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

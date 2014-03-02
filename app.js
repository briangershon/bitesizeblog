/**
 * Module dependencies.
 */

var github = require('octonode'),
  marked = require('marked'),
  GH = require('bitesize').GH,
  Blog = require('bitesize').Blog,
  Promise = require('es6-promise').Promise,
  _ = require('lodash'),
  YAML = require('yamljs'),
  fs = require('fs'),
  path = require('path');

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var feedRoute = require('./routes/feed');

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

  var readCache = function (filename) {
    try {
      var filePath = path.join(__dirname + "/" + filename);
      var data = fs.readFileSync(filePath, "utf8");
      var cachedResults = YAML.parse(data);
      return cachedResults;
    }
    catch (err) {
      return null;
    }
  };

  var writeCache = function (filename, data) {
    var filePath = path.join(__dirname + "/" + filename);
    fs.writeFileSync(filePath, YAML.stringify(data), "utf8");
  };

} else {
  var readCache = function () { return null; };
  var writeCache = function () {};
}

var config = {
  BITESIZE_GITHUB_ACCESS_TOKEN: process.env.BITESIZE_GITHUB_ACCESS_TOKEN,
  BITESIZE_BLOG_GITHUB_REPO: process.env.BITESIZE_BLOG_GITHUB_REPO,
  BITESIZE_BLOG_GITHUB_POST_PATH: process.env.BITESIZE_BLOG_GITHUB_POST_PATH,
  BITESIZE_BLOG_IMAGE_ROUTE: process.env.BITESIZE_BLOG_IMAGE_ROUTE,
  BITESIZE_BLOG_IMAGE_PATH: process.env.BITESIZE_BLOG_IMAGE_PATH
};
app.set('config', config);

var envAccessToken = config.BITESIZE_GITHUB_ACCESS_TOKEN,
  envGitHubRepo = config.BITESIZE_BLOG_GITHUB_REPO,
  envPostPath = config.BITESIZE_BLOG_GITHUB_POST_PATH;

var client = github.client(envAccessToken);
var ghrepo = client.repo(envGitHubRepo);

app.locals.configCache = readCache('config.cache.txt');
app.locals.postCache = readCache('post.cache.txt') || [];

app.locals.getConfig = function () {
  console.log('app.locals.getConfig ENTER');

  return new Promise(function (resolve, reject) {
    if (app.locals.configCache) {
      console.log('app.locals.getConfig FROM CACHE');
      resolve(app.locals.configCache);
      return;
    }

    var gh = new GH({
      ghrepo: ghrepo
    });

    gh.getFile('config.yml').then(function (configFile) {
      console.log('app.locals.getConfig RETRIEVED');
      app.locals.configCache = YAML.parse(configFile.content);
      writeCache('config.cache.txt', app.locals.configCache);
      resolve(app.locals.configCache);
    });
  });
};

function rewriteImageURLs(body, imagePrefix, imageNewPrefix) {
  var re = new RegExp(imagePrefix, 'g');
  return body.replace(re, imageNewPrefix);
}

app.locals.getPosts = function () {
  console.log('app.locals.getPosts ENTER');
  return new Promise(function (resolve, reject) {
    if (app.locals.postCache.length > 0) {
      console.log('app.locals.getPosts FROM CACHE');
      resolve(app.locals.postCache);
      return;
    }

    var gh = new GH({
      ghrepo: ghrepo,
      postPath: envPostPath
    });

    Promise.all([app.locals.getConfig(), gh.getAllFiles()]).then(function (results) {
      var config = results[0],
        posts = results[1];

      var blog = new Blog(posts),
        renderedPosts = [];

      _.sortBy(blog.posts, 'name').reverse().forEach(function (post) {
        post.body = rewriteImageURLs(post.body, config.image_prefix, config.image_new_prefix);
        post.body = marked(post.body);
        renderedPosts.push(post);
      });
      app.locals.postCache = renderedPosts;
      writeCache('post.cache.txt', app.locals.postCache);
      app.locals.cacheTimestamp = new Date();

      console.log('app.locals.getPosts RETRIEVED');
      resolve(renderedPosts);
    });

  });
};

app.get('/', routes.index);
app.get('/atom.xml', feedRoute.feed);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

/**
 * Module dependencies.
 */

var PRODUCTION_CACHE_TTL = '30m';

var github = require('octonode'),
  marked = require('marked'),
  Snag = require('snag').Snag,
  Blog = require('bitesize').Blog,
  Promise = require('es6-promise').Promise,
  _ = require('lodash'),
  YAML = require('yamljs'),
  fs = require('fs'),
  path = require('path'),
  cache = require('arr-cache'),
  yfm = require('yfm');

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

var c = cache();

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
      return undefined;
    }
  };

  var writeCache = function (filename, data) {
    var filePath = path.join(__dirname + "/" + filename);
    fs.writeFileSync(filePath, YAML.stringify(data), "utf8");
  };

} else {
  var readCache = function (key) {
    return c.fetch(key);
  };
  var writeCache = function (key, data) {
    c.add(key, data, PRODUCTION_CACHE_TTL);
  };
}

var envAccessToken = process.env.BITESIZE_GITHUB_ACCESS_TOKEN,
  envGitHubRepo = process.env.BITESIZE_BLOG_GITHUB_REPO,
  envPostPath = process.env.BITESIZE_BLOG_GITHUB_POST_PATH;

var client = github.client(envAccessToken);
var ghrepo = client.repo(envGitHubRepo);

app.locals.getConfig = function () {
  app.locals.configCache = readCache('config.cache.txt');

  return new Promise(function (resolve) {
    if ('undefined' !== typeof app.locals.configCache) {
      console.log('app.locals.getConfig FROM CACHE');
      resolve(app.locals.configCache);
      return;
    }

    var snag = new Snag({
      ghrepo: ghrepo
    });

    snag.getFile('config.yml').then(function success(configFile) {
      console.log('app.locals.getConfig RETRIEVED');
      app.locals.configCache = YAML.parse(configFile.content);
      writeCache('config.cache.txt', app.locals.configCache);
      resolve(app.locals.configCache);
    }, function fail() {
      resolve({});
    });
  });
};

app.locals.getPosts = function () {
  app.locals.postCache = readCache('post.cache.txt');

  return new Promise(function (resolve) {
    if ('undefined' !== typeof app.locals.postCache && app.locals.postCache.length > 0) {
      console.log('app.locals.getPosts FROM CACHE');
      resolve(app.locals.postCache);
      return;
    }

    var snag = new Snag({
      ghrepo: ghrepo,
      path: envPostPath
    });

    Promise.all([app.locals.getConfig(), snag.getAllFiles()]).then(function (results) {
      var contentConfig = results[0],
        posts = results[1];

      var incomingPosts = posts.map(function (post) {
        return {name: post.name, content: yfm(post.content)};
      });

      var blog = new Blog(incomingPosts, {
          image_prefix: contentConfig.image_prefix,
          image_new_prefix: contentConfig.image_new_prefix
        }),
        renderedPosts = [];

      _.sortBy(blog.posts, 'name').reverse().forEach(function (post) {
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

app.locals.getConfig().then(function (contentConfig) {
  app.get(contentConfig.permalink, postRoute.index);
});


http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

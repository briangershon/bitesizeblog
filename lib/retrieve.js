/**
 * Retrieve and cache configuration and blog posts.
 *
 * Caching in "development" mode saves/retrieves data via local file system.
 * In "production" mode, cache saves/retrieves data in memory.
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

var envAccessToken = process.env.BITESIZE_GITHUB_ACCESS_TOKEN,
  envGitHubRepo = process.env.BITESIZE_BLOG_GITHUB_REPO,
  envPostPath = process.env.BITESIZE_BLOG_GITHUB_POST_PATH;

var client = github.client(envAccessToken);
var ghrepo = client.repo(envGitHubRepo);

var c = cache();

exports.readCache = function (app, key) {
  if ('development' === app.get('env')) {
    try {
      var filePath = path.join(__dirname + "/" + key);
      var data = fs.readFileSync(filePath, "utf8");
      var cachedResults = YAML.parse(data);
      return cachedResults;
    }
    catch (err) {
      return undefined;
    }
  } else {
    return c.fetch(key);
  }
};

exports.writeCache = function (app, key, data) {
  if ('development' === app.get('env')) {
    var filePath = path.join(__dirname + "/" + key);
    fs.writeFileSync(filePath, YAML.stringify(data), "utf8");
  } else {
    c.add(key, data, PRODUCTION_CACHE_TTL);
  }
};

exports.getConfig = function (app) {
  app.locals.configCache = exports.readCache(app, 'config.cache.txt');

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
      exports.writeCache(app, 'config.cache.txt', app.locals.configCache);
      resolve(app.locals.configCache);
    }, function fail() {
      resolve({});
    });
  });
};

exports.getPosts = function (app) {
  app.locals.postCache = exports.readCache(app, 'post.cache.txt');

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

    Promise.all([app.locals.getConfig(app), snag.getAllFiles()]).then(function (results) {
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
      exports.writeCache(app, 'post.cache.txt', app.locals.postCache);
      app.locals.cacheTimestamp = new Date();

      console.log('app.locals.getPosts RETRIEVED');
      resolve(renderedPosts);
    });

  });
};

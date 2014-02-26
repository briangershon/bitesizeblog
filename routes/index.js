/*
 * GET home page.
 */

var github = require('octonode'),
  marked = require('marked'),
  GH = require('bitesize').GH,
  Blog = require('bitesize').Blog,
  moment = require('moment');

exports.index = function (req, res) {
  var envAccessToken = req.app.get('config').BITESIZE_GITHUB_ACCESS_TOKEN,
    envGitHubRepo = req.app.get('config').BITESIZE_BLOG_GITHUB_REPO,
    envPostPath = req.app.get('config').BITESIZE_BLOG_GITHUB_POST_PATH;

  var client = github.client(envAccessToken);
  var ghrepo = client.repo(envGitHubRepo);

  var gh = new GH({
    ghrepo: ghrepo,
    postPath: envPostPath
  });

  var title = req.app.get('config').BITESIZE_BLOG_TITLE;

  gh.getAllFiles().then(function (posts) {
    var blog = new Blog(posts),
      renderedPosts = [],
      body;

    blog.posts.forEach(function (post) {
      body = post.sections().body;
      if (post.post.type === 'markdown') {
        body = marked(post.sections().body);
      }

      var header = post.sections().header;
      renderedPosts.push({
        title: header.title,
        date: moment(header.date).format('LL'),
        categories: header.categories,
        tags: header.tags,
        body: body
      });
    });
    res.render('index', {title: title, posts: renderedPosts});
  });
};
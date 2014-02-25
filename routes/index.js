/*
 * GET home page.
 */

var github = require('octonode'),
  marked = require('marked'),
  Blog = require('bitesize').Blog;

exports.index = function (req, res) {
  var envAccessToken = req.app.get('config').BITESIZE_GITHUB_ACCESS_TOKEN,
    envGitHubRepo = req.app.get('config').BITESIZE_BLOG_GITHUB_REPO,
    envPostPath = req.app.get('config').BITESIZE_BLOG_GITHUB_POST_PATH;

  var client = github.client(envAccessToken);
  var ghrepo = client.repo(envGitHubRepo);

  var blog = new Blog({
    ghrepo: ghrepo,
    postPath: envPostPath
  });

  var title = req.app.get('config').BITESIZE_BLOG_TITLE;

  blog.getAllPosts().then(function (posts) {
    posts.forEach(function (post) {
      if (post.type === 'markdown') {
        post.content = marked(post.content);
      }
    });
    res.render('index', {title: title, posts: posts});
  });
};
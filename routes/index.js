/*
 * GET home page.
 */

var github = require('octonode'),
  marked = require('marked'),
  Blog = require('bitesize').Blog;

var envAccessToken = process.env.BITESIZE_GITHUB_ACCESS_TOKEN,
  envGitHubRepo = process.env.BITESIZE_GITHUB_REPO,
  envPostPath = process.env.BITESIZE_POST_PATH;

var client = github.client(envAccessToken);
var ghrepo = client.repo(envGitHubRepo);

var blog = new Blog({
  ghrepo: ghrepo,
  postPath: envPostPath
});

exports.index = function (req, res) {
  blog.getAllPosts().then(function (posts) {
    posts.forEach(function (post) {
      if (post.type === 'markdown') {
        post.content = marked(post.content);
      }
    });
    res.render('index', {title: 'blog.evolvingbits.com', posts: posts});
  });
};
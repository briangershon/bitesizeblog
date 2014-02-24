# bitesizeblog

Personal blog based on bitesize library.

## Background

I'm a big fan of the Jekyll-based static blog sites, namely writing markdown files and saving in GitHub.

I enjoyed Octopress, and started porting to Hexo, but really want to have only my content in a repo with simple blog infrastructure.

This has led to developing the `bitesize` JavaScript library, which won't generate a static site, but will source the blog markdown content from a GitHub repo.

## How to run site in development mode

Create system environmental variables:

        export BITESIZE_GITHUB_ACCESS_TOKEN='token-goes-here'   # create token at github.com
        export BITESIZE_GITHUB_REPO='briangershon/hexo-blog'    # the username and repository
        export BITESIZE_POST_PATH='source/_posts'               # a path within that repository

Install node modules and start up Supervisor:

        npm install
        npm start

View site at http://localhost:3000

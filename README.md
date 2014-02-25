# bitesizeblog

Personal blog based on bitesize library.

## Background

I'm a big fan of the Jekyll-based static blog sites, namely writing markdown files and saving in GitHub.

I enjoyed Octopress, and started porting to Hexo, but really want to have only my content in a repo with simple blog infrastructure.

This has led to developing the `bitesize` JavaScript library, which won't generate a static site, but will source the blog markdown content from a GitHub repo.

## How to run site in development mode

Customize blog via setting system environmental variables:

        # set these in your shell, or in your deployment environment
        #   e.g. heroku config:set BITESIZE_GITHUB_ACCESS_TOKEN='xyz'

        # create access token in github.com
        BITESIZE_GITHUB_ACCESS_TOKEN='token-goes-here'
        BITESIZE_BLOG_TITLE='new.blog.evolvingbits.com'
        BITESIZE_BLOG_GITHUB_REPO='briangershon/blog.evolvingbits.com'
        BITESIZE_BLOG_GITHUB_POST_PATH='posts'
        BITESIZE_BLOG_IMAGE_ROUTE='/images/post/*'
        BITESIZE_BLOG_IMAGE_PATH='https://raw.github.com/briangershon/blog.evolvingbits.com/master'

Install node modules and start up app:

        npm install
        npm start

View site at http://localhost:3000

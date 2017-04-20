# Gulp Boilerplate for HTML/CSS/JS development
Simple Boilerplate for HTML/CSS/JS development based on Gulp.

## Installation
```bash
npm install
gulp
```

## Features
1. Sass (compiles to CSS)
2. CSS Minify
3. JS Minify (not include vendors folder)
4. Image Sprite Generate
5. HTML, CSS, JS LiveReload

## Structure
* public
    * dist (desination folders. it auto building when you'are first run gulp)
    * src (developer working folders)
        * css
            * scss
                * common
                * mixins
                * pages
        * img
            * sprites
                * folder-01
                * folder-02
                * folder-03
        * js
            * vendors
        * views
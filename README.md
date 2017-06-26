# Gulp Boilerplate for HTML/CSS/JS development
Simple Boilerplate for HTML/CSS/JS development based on Gulp.

## Installation
1. Install Node.js (https://nodejs.org)
2. Fork this repository.
3. Move to folders and Install the dependencies.
```sh
$ npm install
```
4. After Install dependencies and Run Gulp.
```sh
$ gulp
```

## Features
1. Sass (compiles to CSS)
2. Less (compiles to CSS)
3. CSS Minify
4. JS Minify (not include library folder)
5. Image Sprite Generate
6. Image Optimization
7. HTML, CSS, JS Browsersync

## Structure
* dist (desination folders. it auto building when you'are first run gulp)
* src (developer working folders)
    * css
        * scss
            * common
            * mixins
            * pages
        * less
            * common
            * mixins
            * pages
        * libs
    * img
        * sprites
            * folder-01
            * folder-02
            * folder-03
    * js
        * apps
        * libs
    * views

## Guide gulpfile.js
https://github.com/hellomrma/gulp-boilerplate/tree/master/%40guideGulpfile

## History
26 JUN 2017
* Guide gulpfile.js 문서 작성
* gulpfile.js 업데이트 (코드 정리)
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
2. CSS Minify
3. JS Minify (not include library folder)
4. Image Sprite Generate
5. Image Optimization
6. SVG Icon
6. HTML, CSS, JS Browsersync

## Structure
* dist (desination folders. it auto building when you'are first run gulp)
* src (developer working folders)
    * css
        * libs
        * scss
            * common
            * mixins
            * pages
    * font
    * img
        * icons
        * sprites
            * bul
            * ico
            * txt
        * svg
    * js
        * apps
        * libs
    * views

## History
15 MAY 2018
* SVG Icon 외 다수 업데이트

26 JUN 2017
* Guide gulpfile.js 문서 작성
* gulpfile.js 업데이트 (코드 정리)
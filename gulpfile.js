var gulp = require('gulp');
var sass = require('gulp-sass');
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var spritesmith = require('gulp.spritesmith-multi');
var merge = require('merge-stream');
var imagemin = require('gulp-imagemin');
var runSequence = require('run-sequence');
var del = require('del');
var watch = require('gulp-watch');
var wait = require('gulp-wait');
var concatCss = require('gulp-concat-css');
var browserSync = require('browser-sync').create();
var plumber = require('gulp-plumber');

var bases = {
    src: 'src/',
    dest: 'dist/'
};

var paths = {
    js: bases.src + 'js/**/*.js',
    css: bases.src + 'css/libs/**/*.css',
    scss: bases.src + 'css/scss/**/*.scss',
    less: bases.src + 'css/less/**/*.less',
    html: bases.src + '**/*.html',
    images: bases.src + 'img/**/*.*',
    sprites: bases.src + 'img/sprites/**/*.*'
};

var errorHandler = function (error) {
    console.error(error.message);
    this.emit('end');
};

var plumberOption = {
    errorHandler: errorHandler
}

gulp.task('html', function () {
    return gulp.src(paths.html)
        .pipe(gulp.dest(bases.dest))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('js-libs', ['clean-js-folders'], function () {
    return gulp.src(bases.src + 'js/libs/**/*.*')
        .pipe(gulp.dest(bases.dest + 'js/libs'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('css-libs', function () {
    return gulp.src(bases.src + 'css/libs/**/*.*')
        .pipe(gulp.dest(bases.dest + 'css/libs'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('minify-js', ['js-libs'], function () {
    return gulp.src([paths.js, '!src/js/libs/**/*.*'])
        .pipe(plumber(plumberOption))
        .pipe(concat('project-name.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(bases.dest + 'js'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('sass', function () {
    return gulp.src(paths.scss)
        // .pipe(wait(500))
        .pipe(plumber(plumberOption))
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(autoprefixer({
            browsers: ['last 2 version', 'safari 5', 'ie 7', 'ie 8', 'ie 9', 'ios 6', 'android 4'],
            cascade: false
        }))
        .pipe(gulp.dest(bases.dest + 'css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('minify-css', function () {
    gulp.src([bases.dest + 'css/**/*.css', '!dist/css/**/*.min.css'])
        .pipe(plumber(plumberOption))
        .pipe(cssmin())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(bases.dest + 'css'));
});

gulp.task('images', function () {
    return gulp.src(paths.images)
        .pipe(imagemin())
        .pipe(gulp.dest(bases.dest + 'img'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('sprites', function () {
    var opts = {
        spritesmith: function (options, sprite, icons) {
            options.imgPath = `../img/sprites/${options.imgName}`;
            options.cssName = `${sprite}-sprites.css`;
            options.cssTemplate = null;
            options.cssSpritesheetName = sprite;
            options.padding = 4;
            options.cssVarMap = function (sp) {
                sp.name = `${sprite}-${sp.name}`;
            };
            return options;
        }
    };
    var spriteData = gulp.src('./src/img/sprites/**/*.png').pipe(spritesmith(opts)).on('error', function (err) {
        console.log(err)
    });

    var imgStream = spriteData.img.pipe(gulp.dest('./dist/img/sprites'));
    var cssStream = spriteData.css.pipe(gulp.dest('./dist/css/sprites'));

    return merge(imgStream, cssStream);
});

gulp.task('sprites-css-concat', function () {
    return gulp.src(bases.dest + 'css/sprites/**/*.css')
        .pipe(plumber(plumberOption))
        .pipe(concatCss("sprites.css"))
        .pipe(gulp.dest(bases.dest + 'css/sprites'));
});

gulp.task('clean-dist-folders', function () {
    return del(bases.dest + '*.*');
});

gulp.task('clean-img-folders', function () {
    return del(bases.dest + 'img');
});

gulp.task('clean-css-folders', function () {
    return del(bases.dest + 'css');
});

gulp.task('clean-js-folders', function () {
    return del(bases.dest + 'js');
});

gulp.task('generate-sass', function () {
    runSequence('clean-css-folders', 'css-libs', 'sprites', 'sass', 'sprites-css-concat', 'minify-css');
});

gulp.task('generate-images-sprites', function () {
    runSequence('clean-css-folders', 'clean-img-folders', 'images', 'css-libs', 'sprites', 'sass', 'sprites-css-concat', 'minify-css');
});

gulp.task('watch', function () {
    gulp.watch(paths.html, ['html']);
    gulp.watch(paths.js, ['minify-js']);
    watch([paths.css], function () {
        gulp.start('generate-sass');
    });
    gulp.watch(paths.scss, ['sass']);
    watch([paths.images], function () {
        gulp.start('generate-images-sprites');
    });
});

gulp.task('init-dist-resources', function () {
    gulp.start('clean-dist-folders');
    gulp.start('minify-js');
    gulp.start('generate-images-sprites');
    gulp.start('html');
});

gulp.task('server', ['watch'], function () {
    browserSync.init({
        server: {
            baseDir: bases.dest
        }
    });
});

gulp.task('default', ['init-dist-resources', 'server']);
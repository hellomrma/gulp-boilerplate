# Guide gulpfile.js

## 전체 동작 프로세스
1. gulp 구동 시 리소스(resources) 초기화 진행.
2. server 를 띄우고 초기 설정해둔 파일 형식 또는 경로를 주시(watch)함.
3. HTML / JS / IMAGE / SCSS / LESS 파일의 변경이 있을 시 각각의 task(작업)를 실행함.

## setting paths
```javascript
var bases = {
    src: 'src/',
    dest: 'dist/'
};
var paths = {
    js: bases.src + 'js/**/*.js',
    css: bases.src + 'css/**/*.*',
    cssLibs: bases.src + 'css/libs/**/*.css',
    scss: bases.src + 'css/scss/**/*.scss',
    less: bases.src + 'css/less/**/*.less',
    html: bases.src + '**/*.html',
    images: bases.src + 'img/**/*.*',
    sprites: bases.src + 'img/sprites/**/*.*'
};
```
1. src 폴더  
SASS / LESS / JS / IMAGE 등의 원본 형태의 파일들이 모여 있는 폴더.   
2. dist 폴더  
배포 폴더이며 이미지 최적화, SASS / LESS 컴파일, Image Sprite 작업이 이루어진 후 옮겨지는 폴더.  최종적으로 웹에서 보여지는 폴더임.

## task1 - initialize-resouces

```javascript
gulp.task('initialize-resources', function () {
    gulp.start('clean-dist-folders');
    gulp.start('generate-sprites');
    gulp.start('minify-js');
    gulp.start('html');
    gulp.start('server');
});
```

1. clean-dist-folders
배포 폴더를 삭제  
(기존 작업을 하면서 남아 있는 불필요한 파일 및 폴더를 깨끗이 정리함으로써 리소스가 덮어지면서   생기는 오류를 예방 하기 위함)
2. generate-image-sprites  
이미지 스프라이트를 제작해 주는 task 를 실행.  

```javascript
gulp.task('generate-sprites', function () {
    runSequence('clean-css-folders', 'clean-img-folders', 'images', 'css-libs', 'sprites', 'sass', 'less', 'sprites-css-concat', 'minify-libs-css', 'minify-css');
});
```
위 task 는 이미지가 업데이트 됨으로써 실행되는 일련의 작업들을 한데 모아둠.  
스프라이트 task 는 CSS 의 변경까지 영향이 가기 때문에 CSS 와 관련된 task 까지 함께 실행함.  

3. minify-js  
Javascript 파일을 압축(minify) 함.  
4. html  
html 파일을 배포(dist) 폴더에 복사함.  
5. server  
server 를 띄움.  

## task2 - watch
```javascript
gulp.task('watch', function () {
    gulp.watch(paths.html, ['html']);
    gulp.watch(paths.js, ['minify-js']);
    gulp.watch(paths.css, ['generate-sass-less']);
    gulp.watch(paths.images, ['generate-sprites']);
});
```
1. html 수정이 일어났을 때 **html** task 를 실행.
2. js 수정이 일어났을 때 **minify-js** task 를 실행.
3. css (SASS / LESS / ETC CSS) 수정이 일어났을 때 **generate-sass-less** task 를 실행.
4. image 수정이 일어났을 때 **generate-sprites** task 를 실행.

## task3 - server
```javascript
gulp.task('server', ['watch'], function () {
    browserSync.init({
        server: {
            baseDir: bases.dest
        },
        port: 3030
    });
});
```
1. browserSync 를 활용해 서버를 띄움.  
2. 바라보는 폴더는 배포(dist) 폴더.  
3. 기본 port 는 3030  

Gulp browserSync Documentation (https://browsersync.io/docs/gulp)  

## task4 - html
```javascript
gulp.task('html', function () {
    return gulp.src(paths.html)
        .pipe(gulp.dest(bases.dest))
        .pipe(browserSync.reload({
            stream: true
        }));
});
```
html 파일의 변화가 일어났을때 배포(dist) 폴더로 배포 후 페이지를 reload 함.

## task5 - minify-js
```javascript
gulp.task('clean-js-folders', function () {
    return del(bases.dest + 'js');
});

gulp.task('js-libs', ['clean-js-folders'], function () {
    return gulp.src(bases.src + 'js/libs/**/*.*')
        .pipe(gulp.dest(bases.dest + 'js/libs'))
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
```
1. **minify-js** task 를 실행하기 앞서 **clean-js-folders** **js-libs** task 를 실행함.
2. **clean-js-folders** task 는 배포(dist) 폴더 내 js 폴더 삭제.
3. **js-libs** task 는 library 폴더 / 파일을 그대로 복사함.
4. **minify-js** task 에서 libs 폴더를 제외한 js 파일을 합치고(concat) 압축(uglify)후 배포(dist) 폴더로 옮김.
5. 브라우저 reload. (**stream: true** 는 변경된 파일만 브라우저에 전송되어 새로고침(Refresh) 없이도 반영이 되는 옵션.
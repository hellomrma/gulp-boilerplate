# Guide gulpfile.js

## 전체 동작 프로세스
1. gulp 구동 시 리소스(resources) 초기화 진행.
2. server 를 띄우고 초기 설정해둔 파일 형식 또는 경로를 주시(watch)함.
3. HTML / JS / IMAGE / SCSS / LESS 파일의 변경이 있을 시 각각의 task(작업)를 실행함.

## SETTING PATHS
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

## TASK1 - initialize-resouces

```javascript
gulp.task('initialize-resources', function () {
    gulp.start('clean-dist-folders');
    gulp.start('generate-sprites');
    gulp.start('minify-js');
    gulp.start('html-deploy');
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
    runSequence('clean-css-folders', 'clean-img-folders', 'images-deploy', 'css-libs-deploy', 'sprites', 'sass', 'less', 'sprites-css-concat', 'minify-libs-css', 'minify-css');
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

## TASK2 - watch
```javascript
gulp.task('watch', function () {
    gulp.watch(paths.html, ['html-deploy']);
    gulp.watch(paths.js, ['minify-js']);
    gulp.watch(paths.css, ['generate-sass-less']);
    gulp.watch(paths.images, ['generate-sprites']);
});
```
1. html 수정이 일어났을 때 **html-deploy** task 를 실행.
2. js 수정이 일어났을 때 **minify-js** task 를 실행.
3. css (SASS / LESS / ETC CSS) 수정이 일어났을 때 **generate-sass-less** task 를 실행.
4. image 수정이 일어났을 때 **generate-sprites** task 를 실행.

## TASK3 - server
```javascript
gulp.task('server', ['watch'], function () {
    browserSync.init({
        server: {
            baseDir: bases.dest
        },
        options: {
            reloadDelay: 250
        },
        port: 3030,
        notify: false
    });
});
```
1. browserSync 를 활용해 서버를 띄움.  
2. 바라보는 폴더는 배포(dist) 폴더.  
3. 기본 port 는 3030  

Gulp browserSync Documentation (https://browsersync.io/docs/gulp)  

## TASK4 - html
```javascript
gulp.task('html-deploy', function () {
    return gulp.src(paths.html)
        .pipe(gulp.dest(bases.dest))
        .pipe(browserSync.reload({
            stream: true
        }));
});
```
html 파일의 변화가 일어났을때 배포(dist) 폴더로 배포 후 페이지를 reload 함.

## TASK5 - minify-js
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

gulp.task('minify-js', ['js-libs-deploy'], function () {
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
1. **minify-js** task 를 실행하기 앞서 **clean-js-folders**, **js-libs-deploy** task 를 실행함.
2. **clean-js-folders** task 는 배포(dist) 폴더 내 js 폴더 삭제.
3. **js-libs-deploy** task 는 library 폴더 / 파일을 그대로 복사함.
4. **minify-js** task 에서 libs 폴더를 제외한 js 파일을 합치고(concat) 압축(uglify)후 배포(dist) 폴더로 옮김.
5. 브라우저 reload. (**stream: true** 는 변경된 파일만 브라우저에 전송되어 새로고침(Refresh) 없이도 반영이 되는 옵션.

plumber 의 역할은 task 를 진행하다가 발생되는 오류로 인해 튕기는 걸 막아주는 역할을 함.  
튕기는 대신 에러(error) 로그를 발생 시켜줌.  
```javascript
var errorHandler = function (error) {
    console.error(error.message);
    this.emit('end');
};
var plumberOption = {
    errorHandler: errorHandler
};
```

## TASK6 - generate-sass-less
```javascript
gulp.task('generate-sass-less', function () {
    runSequence('clean-css-folders', 'css-libs-deploy', 'sprites', 'sprites-css-concat', 'sass', 'less', 'minify-libs-css', 'minify-css');
});
```
**generate-sass-less** task 는 runSequence 를 활용해서 multi-tasking 을 구현 함.

1. SASS / LESS 파일을 수정하면 컴파일 하기전에 **clean-css-folders** task 를 먼저 실행 함.
(다양하게 테스트를 해 본 결과, 배포(dist) 폴더에 파일들이 남아 있으면 코드가 꼬이는 경우가 발생했었음. 이를 방지하기 위함.)
2. **css-libs-deploy** task 는 library 관련 CSS 를 옮김.
3. css 폴더를 삭제 했음으로 **sprites**, **sprites-css-concat** task 를 실행하여 스프라이트 CSS 를 생성함.
4. SASS / LESS 파일을 컴파일 한 후
5. **minify-libs-css** task 를 통하여 libs 폴더의 CSS 를 모두 병합.
6. 마지막으로 이 파일들을 **minify-css** task 를 통하여 minify 함.

### 세부 TASK 설명
#### clean-css-folders
```javascript
gulp.task('clean-css-folders', function () {
    return del(bases.dest + 'css');
});
```
배포(dist) 폴더 내 CSS 폴더를 삭제 함.

#### css-libs-deploy
```javascript
gulp.task('css-libs-deploy', function () {
    return gulp.src(bases.src + 'css/libs/**/*.*')
        .pipe(gulp.dest(bases.dest + 'css/libs'))
        .pipe(browserSync.reload({
            stream: true
        }));
});
```
libs 폴더의 파일들을 배포(dist) 폴더내 css/libs 폴더로 복사 함.

#### sass / less
```javascript
gulp.task('sass', function () {
    return gulp.src(paths.scss)
        .pipe(plumber(plumberOption))
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'],
            cascade: false
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(bases.dest + 'css/scss'));
});

gulp.task('less', function () {
    return gulp.src(bases.src + 'css/less/*.less')
        .pipe(plumber(plumberOption))
        .pipe(sourcemaps.init())
        .pipe(less({
            plugins: [autoprefix]
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(bases.dest + 'css/less'));
});
```
1. SASS / LESS 컴파일(SCSS to CSS / LESS to CSS)을 하기 전 plumber 를 사용해 오류로 인한 튕김을 방지함.
2. sourcemaps 실행  
sourcemaps 는 브라우저 개발자도구(F12)에서 특정 element 를 클릭했을 때 해당 속성이 어떤 SCSS or LESS 파일의 몇번째 라인에 있는 건지 알수 있게 도와주는 역할을 함.  

**주의** : 최종적으로 min 파일로 나오는 CSS 의 경우엔 sourcemaps 정보가 사라지기 때문에 프로젝트 진행중에는 압축되지 않은 파일을 불러오는게 좋음.  

3. SASS / LESS 컴파일 실행. (vendor prefix 적용)  
4. sourcemaps 입력 실행.  
5. 배포(dist) 폴더로 복사  

## TASK7 - generate-sprites
```javascript
gulp.task('generate-sprites', function () {
    runSequence('clean-css-folders', 'clean-img-folders', 'images-deploy', 'css-libs-deploy', 'sprites', 'sprites-css-concat', 'sass', 'less', 'minify-libs-css', 'minify-css');
});
```

# Guide gulpfile.js

## 전체 동작 프로세스
> 1. gulp 구동 시 리소스(resources) 초기화 진행.
> 2. server 를 띄우고 초기 설정해둔 파일 형식 또는 경로를 주시(watch)함.
> 3. HTML / JS / IMAGE / SCSS / LESS 파일의 변경이 있을 시 각각의 task(작업)를 실행함.

## task1 - initialize-resouces

```javascript
gulp.task('initialize-resources', function () {
    gulp.start('clean-dist-folders');
    gulp.start('generate-images-sprites');
    gulp.start('minify-js');
    gulp.start('html');
    gulp.start('server');
});
```

> 1. clean-dist-folders
> 배포 폴더를 삭제  
> (기존 작업을 하면서 남아 있는 불필요한 파일 및 폴더를 깨끗이 정리함으로써 리소스가 덮어지면서   생기는 오류를 예방 하기 위함)
> 2. generate-image-sprites  
> 이미지 스프라이트를 제작해 주는 task 를 실행.  

```javascript
gulp.task('generate-images-sprites', function () {
    runSequence('clean-css-folders', 'clean-img-folders', 'images', 'css-libs', 'sprites', 'sass', 'less', 'sprites-css-concat', 'minify-libs-css', 'minify-css');
});
```
> 위 task 는 이미지가 업데이트 됨으로써 실행되는 일련의 작업들을 한데 모아둠.  
> 스프라이트 task 는 CSS 의 변경까지 영향이 가기 때문에 CSS 와 관련된 task 까지 함께 실행함.  

## task2

var gulp = require('gulp');
    concat = require('gulp-concat'),
    notify = require('gulp-notify');

//https://markgoodyear.com/2014/01/getting-started-with-gulp/

//gulp.task('scripts', function() {
//  return gulp.src('src/scripts/**/*.js')
//      .pipe(jshint('.jshintrc'))
//      .pipe(jshint.reporter('default'))
//      .pipe(concat('main.js'))
//      .pipe(gulp.dest('dist/assets/js'))
//      .pipe(rename({suffix: '.min'}))
//      .pipe(uglify())
//      .pipe(gulp.dest('dist/assets/js'))
//      .pipe(notify({ message: 'Scripts task complete' }));
//});

gulp.task('scripts', function() {
  return gulp.src('./web/js/rampage/*.js')
      .pipe(concat('build.js'))
      .pipe(gulp.dest('./web/build/'))
      .pipe(notify({ message: 'Rampage scripts task complete' }));
});

gulp.task('default', function() {
  //gulp.start('styles', 'scripts', 'images');
  gulp.start('scripts');
});

gulp.task('watch', function() {

  // Watch .scss files
  //gulp.watch('src/styles/**/*.scss', ['styles']);

  // Watch .js files
  gulp.watch('web/js/rampage/*.js', ['scripts']);

  // Watch image files
  //gulp.watch('src/images/**/*', ['images']);

});
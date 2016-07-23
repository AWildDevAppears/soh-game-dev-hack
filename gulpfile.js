var gulp      = require('gulp');

var rename    = require('gulp-rename');
var connect   = require('gulp-connect');
var watch     = require('gulp-watch');


var paths = {
  templates:  ['./**/*.html'],
  js: ['./js/**/*.js']
};

gulp.task('watch', function () {
});

gulp.task('server', function() {
  connect.server({
    livereload: true,
    port: 1337,
    host: "localhost",
    root: '.'
  });
});

gulp.task('livereload', function() {
  gulp.src(['css/*.css', 'js/**/*.js', '**/*.html'])
    .pipe(watch(['css/*.css', 'js/**/*.js', '**/*.html']))
    .pipe(connect.reload());
});

gulp.task('default', ['server', 'livereload', 'watch']);

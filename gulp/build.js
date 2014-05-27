'use strict';

var gulp = require('gulp');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

gulp.task('browserify', function () {
       // Single entry point to browserify
    return gulp.src([
      'index.js'
      ])
      .pipe(concat('brwsrfy-metrics.js'))
      .pipe(browserify({
        insertGlobals : false,
        debug : false,
        standalone:'brwsrfy-metrics'
      }))
      .pipe(gulp.dest('./dist'))
      .pipe(uglify())
      .pipe(rename('brwsrfy-metrics.min.js'))
      .pipe(gulp.dest('./dist'))
});

gulp.task('clean', function () {
    return gulp.src(['.tmp', 'dist'], { read: false }).pipe(clean());
});

gulp.task('build', ['browserify']);
